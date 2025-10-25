"use server";
import { db } from "@/db/index";
import { predictionMarkets, proofs, secrets } from "@/db/schema";
import {
  CREATEVOTE_ABI,
  CREATEVOTE_FACTORY_ADDRESS,
  HBAR_LOCKING_CONTRACT_ADDRESS,
  PREDICT_MARKET_FACTORY_ADDRESS,
  PREDICTION_MARKET_ABI,
} from "@/constants";
import { eq, and, lte, gte, lt, gt, asc, desc } from "drizzle-orm";
import { getBlock, getTransactionReceipt } from "@wagmi/core";
import { config, viemClient } from "@/utils/WagmiConfig";
import { readContract } from "@wagmi/core";
import {
  CreateVoteContractConfig,
  PredictionMarketFactoryContractConfig,
} from "@/utils/contracts";
import { parseAbiItem } from "viem";
import axios from "axios";
import {
  decodeAbiParameters,
  getAddress,
  hexToBigInt,
  Hex,
  Address,
} from "viem";
import { decryptVote } from "./decryptVote";
import { buildWinnerLoserMerkles } from "./merkletree";

import { getWalletClient } from "./walletTransaction";

import type { secretParamsT } from "./types";

interface ppT {
  N: string;
  t: bigint;
  a: number;
  sk_locked: string;
  hashedSK: string;
  publicKey: string;
}

interface VoteConfigT {
  optionA: bigint;
  optionB: bigint;
  rewards: bigint;
  startTimestamp: bigint;
  endTimestamp: bigint;
  thresholdVotes: number;
  creator: Address;
  question: string;
  description: string;
}
interface VoteDataT {
  resolvedOption: bigint;
  unlockedSecret: `0x${string}`;
  solver: `0x${string}`;
  totalVotes: number;
}
export interface GetPredictionT {
  question: string;
  description: string;
  outcome1: string;
  outcome2: string;
  oracle: `0x${string}`;
  initialTokenValue: bigint;
  yesTokenReserve: bigint;
  noTokenReserve: bigint;
  isReported: boolean;
  yesToken: `0x${string}`;
  noToken: `0x${string}`;
  winningToken: `0x${string}`;
  ethCollateral: bigint;
  lpTradingRevenue: bigint;
  predictionMarketOwner: `0x${string}`;
  initialProbability: bigint;
  percentageLocked: bigint;
}
import type { VoteCardData } from "./types";
type ReadMap = {
  getPublicParameters: ppT;
  getVoteConfig: VoteConfigT;
  getVoteData: VoteDataT;
};
type MarketReadMap = {
  getPrediction: GetPredictionT;
};
export async function getAddrFromABIEncoded(paddedAddr: `0x${string}`) {
  const [rawAddress] = decodeAbiParameters(
    [{ type: "address" }],
    paddedAddr as `0x${string}`
  );
  const checksummedAddress = getAddress(rawAddress);
  return checksummedAddress;
}

export const getDataFromContract = async <F extends keyof ReadMap>(
  address: `0x${string}`,
  functionName: F
): Promise<ReadMap[F]> => {
  const result = await readContract(config as any, {
    abi: CreateVoteContractConfig.abi,
    address: address,
    functionName: functionName,
  });

  return result as ReadMap[F];
};
export const getDataFromMarket = async <F extends keyof MarketReadMap>(
  address: `0x${string}`,
  functionName: F
): Promise<MarketReadMap[F]> => {
  const result = await readContract(config as any, {
    abi: PREDICTION_MARKET_ABI,
    address: address,
    functionName: functionName,
  });
  if (functionName === "getPrediction") {
    const [
      question,
      description,
      outcome1,
      outcome2,
      oracle,
      initialTokenValue,
      yesTokenReserve,
      noTokenReserve,
      isReported,
      yesToken,
      noToken,
      winningToken,
      ethCollateral,
      lpTradingRevenue,
      predictionMarketOwner,
      initialProbability,
      percentageLocked,
    ] = result as any;

    return {
      question,
      description,
      outcome1,
      outcome2,
      oracle,
      initialTokenValue,
      yesTokenReserve,
      noTokenReserve,
      isReported,
      yesToken,
      noToken,
      winningToken,
      ethCollateral,
      lpTradingRevenue,
      predictionMarketOwner,
      initialProbability,
      percentageLocked,
    } as MarketReadMap[F];
  }
  return result as MarketReadMap[F];
};

export async function addSecrets(secretParams: secretParamsT) {
  try {
    if (
      secretParams.marketId === null ||
      secretParams.N === null ||
      secretParams.t === null ||
      secretParams.a === null ||
      secretParams.skLocked === null ||
      secretParams.hashedSK === null ||
      secretParams.publicKey === null
    ) {
      throw new Error("Missing required fields in args");
    }

    const [inserted] = await db
      .insert(secrets)
      .values({
        marketId: secretParams.marketId,
        N: secretParams.N,
        t: secretParams.t,
        a: secretParams.a,
        skLocked: secretParams.skLocked,
        hashedSK: secretParams.hashedSK,
        publicKey: secretParams.publicKey,
        secretKey:
          secretParams.secretKey ||
          "0x0000000000000000000000000000000000000000",
        verified: false,
        server: secretParams.server,
      })
      .returning();

    return {
      success: true,
      data: inserted,
    };
  } catch (error: any) {
    console.error("Failed to insert in votingcontract:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function verifySecret(txHash: `0x${string}`) {
  const receipt = await getTransactionReceipt(config as any, {
    hash: txHash,
  });

  if (!receipt) {
    return {
      success: false,
    };
  }
  const logs = receipt.logs;
  const _logsHbarLockingContractAddr = await getAddrFromABIEncoded(
    logs[0].topics[1] as `0x${string}`
  );
  const _factoryContractAddr = logs[1].address;
  const _deployedContractAddr = await getAddrFromABIEncoded(
    logs[1].topics[2] as `0x${string}`
  );
  const _marketId = hexToBigInt(logs[1].topics[1] as `0x${string}`);

  if (
    _logsHbarLockingContractAddr.toLowerCase() !=
      HBAR_LOCKING_CONTRACT_ADDRESS.toLowerCase() ||
    _factoryContractAddr.toLowerCase() !=
      CREATEVOTE_FACTORY_ADDRESS.toLowerCase()
  ) {
    return {
      success: false,
    };
  }
  const pp = await getDataFromContract(
    _deployedContractAddr,
    "getPublicParameters"
  );
  const voteConfig = await getDataFromContract(
    _deployedContractAddr,
    "getVoteConfig"
  );

  const [row] = await db
    .select()
    .from(secrets)
    .where(eq(secrets.marketId, _marketId));

  if (!row) {
    return {
      success: false,
      error: "No secrets entry for marketId",
      marketId: _marketId,
    };
  }

  const normalizeHex = (v?: string) => (v ?? "").toLowerCase();

  const matches =
    row.N === pp.N &&
    row.t === pp.t &&
    row.a === pp.a &&
    normalizeHex(row.skLocked) === normalizeHex(pp.sk_locked) &&
    normalizeHex(row.hashedSK) === normalizeHex(pp.hashedSK) &&
    normalizeHex(row.publicKey) === normalizeHex(pp.publicKey);

  if (!matches) {
    return {
      success: false,
      error: "Public parameters mismatch",
      marketId: _marketId,
    };
  }

  // Update contract address and mark as verified
  await db
    .update(secrets)
    .set({
      contractAddress: _deployedContractAddr,
      verified: true,
      startTimeStamp: voteConfig.startTimestamp,
      endTimestamp: voteConfig.endTimestamp,
      optionA: voteConfig.optionA,
      optionB: voteConfig.optionB,
      rewards: voteConfig.rewards,
      question: voteConfig.question,
      description: voteConfig.description,
    })
    .where(eq(secrets.marketId, _marketId));

  return {
    success: true,
    contractAddress: _deployedContractAddr,
    marketId: _marketId,
  };
}

const _marketTitle = "Failed to load market title";
const _marketDescription = "Failed to load market description";

const toVoteCardData = (row: {
  marketId: bigint;
  question: string | null;
  description: string | null;
  N: string;
  t: bigint;
  a: number;
  skLocked: string;
  hashedSK: string;
  publicKey: string;
  verified: boolean;
  server: boolean;
  contractAddress: string | null;
  optionA: bigint | null;
  optionB: bigint | null;
  rewards: bigint | null;
  startTimeStamp: bigint | null;
  endTimestamp: bigint | null;
  solver: string | null;
  unlockedSecret: string | null;
  resolvedOption: bigint | null;
}): VoteCardData => ({
  marketId: row.marketId.toString(),
  title: row.question ?? _marketTitle,
  description: row.description ?? _marketDescription,
  optionATitle: "True/Yes",
  optionBTitle: "False/No",
  rewards: row.rewards?.toString() ?? "0",
  startTimestamp: row.startTimeStamp?.toString() ?? "0",
  endTimestamp: row.endTimestamp?.toString() ?? "0",
  contractAddress: row.contractAddress ?? null,
  verified: !!row.verified,
  server: !!row.server,
  pp: {
    N: row.N,
    t: row.t.toString(),
    a: row.a,
    skLocked: row.skLocked,
    hashedSK: row.hashedSK,
    publicKey: row.publicKey,
  },
  tallies: {
    optionA: row.optionA?.toString() ?? "0",
    optionB: row.optionB?.toString() ?? "1",
  },
  data: {
    solver: row.solver ?? null,
    unlockedSecret: row.unlockedSecret ?? null,
    resolvedOption: row.resolvedOption ?? null,
  },
});

export async function getActiveVotes() {
  try {
    const now = BigInt(Math.floor(Date.now() / 1000));

    const rows = await db
      .select({
        marketId: secrets.marketId,
        N: secrets.N,
        t: secrets.t,
        a: secrets.a,
        skLocked: secrets.skLocked,
        hashedSK: secrets.hashedSK,
        publicKey: secrets.publicKey,
        verified: secrets.verified,
        server: secrets.server,
        contractAddress: secrets.contractAddress,
        optionA: secrets.optionA,
        optionB: secrets.optionB,
        rewards: secrets.rewards,
        startTimeStamp: secrets.startTimeStamp,
        endTimestamp: secrets.endTimestamp,
        solver: secrets.solver,
        unlockedSecret: secrets.unlockedSecret,
        resolvedOption: secrets.resolvedOption,
        question: secrets.question,
        description: secrets.description,
      })
      .from(secrets)
      .where(
        and(
          lte(secrets.startTimeStamp, now),
          gte(secrets.endTimestamp, now),
          eq(secrets.verified, true)
        )
      )
      .orderBy(desc(secrets.startTimeStamp));

    return { success: true, data: rows.map(toVoteCardData) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
export async function getResolvedVotes() {
  try {
    const now = BigInt(Math.floor(Date.now() / 1000));

    const rows = await db
      .select({
        marketId: secrets.marketId,
        N: secrets.N,
        t: secrets.t,
        a: secrets.a,
        skLocked: secrets.skLocked,
        hashedSK: secrets.hashedSK,
        publicKey: secrets.publicKey,
        verified: secrets.verified,
        server: secrets.server,
        contractAddress: secrets.contractAddress,
        optionA: secrets.optionA,
        optionB: secrets.optionB,
        rewards: secrets.rewards,
        startTimeStamp: secrets.startTimeStamp,
        endTimestamp: secrets.endTimestamp,
        solver: secrets.solver,
        unlockedSecret: secrets.unlockedSecret,
        resolvedOption: secrets.resolvedOption,
        question: secrets.question,
        description: secrets.description,
      })
      .from(secrets)
      .where(and(lt(secrets.endTimestamp, now), eq(secrets.verified, true)))
      .orderBy(desc(secrets.endTimestamp));

    return { success: true, data: rows.map(toVoteCardData) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
export async function getUpcomingVotes() {
  try {
    const now = BigInt(Math.floor(Date.now() / 1000));

    const rows = await db
      .select({
        marketId: secrets.marketId,
        N: secrets.N,
        t: secrets.t,
        a: secrets.a,
        skLocked: secrets.skLocked,
        hashedSK: secrets.hashedSK,
        publicKey: secrets.publicKey,
        verified: secrets.verified,
        server: secrets.server,
        contractAddress: secrets.contractAddress,
        optionA: secrets.optionA,
        optionB: secrets.optionB,
        rewards: secrets.rewards,
        startTimeStamp: secrets.startTimeStamp,
        endTimestamp: secrets.endTimestamp,
        solver: secrets.solver,
        unlockedSecret: secrets.unlockedSecret,
        resolvedOption: secrets.resolvedOption,
        question: secrets.question,
        description: secrets.description,
      })
      .from(secrets)
      .where(and(gt(secrets.startTimeStamp, now), eq(secrets.verified, true)))
      .orderBy(asc(secrets.startTimeStamp));

    return { success: true, data: rows.map(toVoteCardData) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePuzzleData(contractAddress: `0x${string}`) {
  const voteData = await getDataFromContract(contractAddress, "getVoteData");
  const unlockedSecret = voteData.unlockedSecret;
  const solver = voteData.solver;

  const ZERO_ADDR = "0x0000000000000000000000000000000000000000";
  const ZERO_BYTES32 =
    "0x0000000000000000000000000000000000000000000000000000000000000000";

  if (
    solver.toLowerCase() === ZERO_ADDR.toLowerCase() ||
    unlockedSecret.toLowerCase() === ZERO_BYTES32.toLowerCase()
  ) {
    return { success: false, solver, unlockedSecret };
  }

  await db
    .update(secrets)
    .set({ solver, unlockedSecret })
    .where(eq(secrets.contractAddress, contractAddress));

  return { success: true, solver, unlockedSecret };
}

export async function getBlockNumbers(
  startTimestamp: bigint,
  endTimestamp: bigint
): Promise<{
  startingBlock: bigint;
  endingBlock: bigint;
}> {
  const startingBlockUrl = `https://testnet.mirrornode.hedera.com/api/v1/blocks?limit=1&timestamp=lte%3A${startTimestamp}`;
  const endingBlockUrl = `https://testnet.mirrornode.hedera.com/api/v1/blocks?limit=1&timestamp=gte%3A${endTimestamp}`;
  const startingBlockResponse = await axios.get(startingBlockUrl);
  const endingBlockResponse = await axios.get(endingBlockUrl);
  const startingBlock = BigInt(startingBlockResponse.data.blocks[0].number);
  const endingBlock = BigInt(endingBlockResponse.data.blocks[0].number);

  return { startingBlock, endingBlock };
}
type VoterWithAmount = { address: Address; amount: bigint };

export async function getAllCastedVotes(contractAddress: `0x${string}`) {
  const contractAddressParsed = getAddress(contractAddress);
  try {
    const result = await db
      .select({ isResolved: proofs.isResolved })
      .from(proofs)
      .where(eq(proofs.contractAddress, contractAddressParsed.toLowerCase()))
      .limit(1);
    if (result[0]?.isResolved) {
      return { success: false, error: "Vote already resolved" };
    }
  } catch (error) {
    console.error("Error getting proofs from DB", error);
    return { success: false, error: "Fetching Proofs Failed" };
  }
  let isVerified: boolean;
  let isServer: boolean;
  let secretKey: string;
  try {
    const [row] = await db
      .select({
        verified: secrets.verified,
        server: secrets.server,
        secretKey: secrets.secretKey,
      })
      .from(secrets)
      .where(eq(secrets.contractAddress, contractAddressParsed))
      .limit(1);
    isVerified = row.verified;
    isServer = row.server;
    secretKey = row.secretKey;
  } catch (error) {
    console.error("Error getting secrets from DB", error);
    return { success: false, error: "Error Connecting to DB" };
  }

  if (!isVerified) {
    return { success: false, error: "Contract not verified" };
  }
  let totalVotes = 0;
  try {
    const { unlockedSecret, totalVotes: _totalVotes } =
      await getDataFromContract(contractAddress, "getVoteData");
    totalVotes = _totalVotes;
    if (!isServer) {
      const ZERO_BYTES32 =
        "0x0000000000000000000000000000000000000000000000000000000000000000";
      if (unlockedSecret.toLowerCase() === ZERO_BYTES32.toLowerCase()) {
        return {
          success: false,
          error: "SecretKey not set or not revealed",
        };
      }
      secretKey = unlockedSecret;
    }
  } catch (error) {
    console.error("Error getting vote data from contract", error);
    return { success: false, error: "Error Getting Vote Data from Contract" };
  }
  console.log(totalVotes);
  if (totalVotes < 2) {
    console.error(
      "Atleast 2 votes required to finalize. Current votes: " + totalVotes
    );
    return {
      success: false,
      error: "Minimum 2 votes are required to finalize",
    };
  }

  let startTimestamp: bigint;
  let endTimestamp: bigint;
  let optionA: bigint;
  let optionB: bigint;
  let rewards: bigint;
  try {
    const {
      startTimestamp: _startTimestamp,
      endTimestamp: _endTimestamp,
      optionA: _optionA,
      optionB: _optionB,
      rewards: _rewards,
    } = await getDataFromContract(contractAddress, "getVoteConfig");
    startTimestamp = _startTimestamp;
    endTimestamp = _endTimestamp;
    optionA = _optionA;
    optionB = _optionB;
    rewards = _rewards;
  } catch (error) {
    console.error("Error getting vote config from contract", error);
    return { success: false, error: "Error Getting Vote Config from Contract" };
  }
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (now < endTimestamp) {
    return { success: false, error: "Vote not started or ended" };
  }
  let startingBlock: bigint;
  let endingBlock: bigint;
  try {
    const { startingBlock: _startingBlock, endingBlock: _endingBlock } =
      await getBlockNumbers(startTimestamp, endTimestamp);
    startingBlock = _startingBlock;
    endingBlock = _endingBlock;
  } catch (error) {
    console.error("Error getting block numbers", error);
    return { success: false, error: "Error Getting Block Numbers" };
  }
  const voteCastEvent = parseAbiItem(
    "event VoteCast(address indexed voter, uint256 indexed userPublicKey, uint256 indexed amount, bytes option)"
  );
  let parsedEventLogs: ParsedVote[] = [];
  try {
    const eventLogs = await viemClient.getLogs({
      address: contractAddressParsed,
      event: voteCastEvent,
      fromBlock: startingBlock,
      toBlock: endingBlock,
    });
    parsedEventLogs = await parseVoteCastLogs(eventLogs);
  } catch (error) {
    console.error("Error fetching cast event logs", error);
    return { success: false, error: "Fetching CastEvent Logs Failed" };
  }
  const Options = [optionA.toString(), optionB.toString()];
  let inValidVotes = 0;
  const OptionVotes: [number, number] = [0, 0];
  const OptionAVoters: VoterWithAmount[] = [];
  const OptionBVoters: VoterWithAmount[] = [];
  let OptionABalances = 0n;
  let OptionBBalances = 0n;
  let addedRewards = 0n;
  let WinningOptionVoters: VoterWithAmount[] = [];
  let LosingOptionVoters: VoterWithAmount[] = [];
  let resolvedOption: bigint | null = null;

  for (const { userAddress, pk, option, amount } of parsedEventLogs) {
    console.log({ userAddress, pk, option, amount });
    try {
      const decrypted = await decryptVote(option, pk, secretKey);
      if (decrypted === Options[0]) {
        OptionVotes[0] += 1;
        OptionAVoters.push({ address: userAddress, amount });
        OptionABalances += amount;
      } else if (decrypted === Options[1]) {
        OptionVotes[1] += 1;
        OptionBVoters.push({ address: userAddress, amount });
        OptionBBalances += amount;
      } else {
        inValidVotes += 1;
      }
    } catch (error) {
      console.error("Error decrypting vote", error);
      return { success: false, error: "Parsing Event Logs Failed" };
    }
  }
  if (OptionVotes[0] > OptionVotes[1]) {
    resolvedOption = optionA;
    WinningOptionVoters = OptionAVoters;
    LosingOptionVoters = OptionBVoters;
    addedRewards = OptionBBalances;
  } else {
    resolvedOption = optionB;
    WinningOptionVoters = OptionBVoters;
    LosingOptionVoters = OptionAVoters;
    addedRewards = OptionABalances;
  }
  let winnerRoot: string;
  try {
    const { winnerRoot: _winnerRoot } = await buildWinnerLoserMerkles(
      WinningOptionVoters,
      LosingOptionVoters,
      contractAddressParsed.toLowerCase()
    );
    winnerRoot = _winnerRoot;
  } catch (error) {
    console.error("Error building merkle tree", error);
    return { success: false, error: "Building Merkle Tree Failed" };
  }
  let txHash: `0x${string}`;
  try {
    const walletClient = await getWalletClient();
    const _txHash = await walletClient.writeContract({
      address: contractAddressParsed,
      abi: CREATEVOTE_ABI,
      functionName: "finalizeVote",
      args: [
        BigInt(OptionVotes[0]),
        BigInt(OptionVotes[1]),
        winnerRoot,
        addedRewards,
      ],
    });
    txHash = _txHash;
  } catch (error) {
    console.error("Error finalizing vote", error);
    return { success: false, error: "Finalized Transaction Failed" };
  }
  try {
    const totalRewards = rewards + addedRewards;
    await db
      .update(proofs)
      .set({ isResolved: true })
      .where(eq(proofs.contractAddress, contractAddressParsed.toLowerCase()));

    await db
      .update(secrets)
      .set({ rewards: totalRewards })
      .where(eq(secrets.contractAddress, contractAddress));
    return { success: true, data: txHash };
  } catch (error) {
    console.error("Error updating proofs in DB", error);
    return { success: false, error: "Updating Proofs Failed" };
  }
}

type ParsedVote = {
  userAddress: Address;
  pk: bigint;
  option: string;
  amount: bigint;
};
export async function parseVoteCastLogs(
  logs: Array<{
    topics: readonly (Hex | string)[];
    data: Hex | string;
    removed?: boolean;
  }>
): Promise<ParsedVote[]> {
  return logs
    .filter((l) => !l.removed)
    .map((l) => {
      const [rawAddr] = decodeAbiParameters(
        [{ type: "address" }],
        l.topics[1] as Hex
      );
      const userAddress = getAddress(rawAddr);
      const pk = hexToBigInt(l.topics[2] as Hex);
      const [option] = decodeAbiParameters([{ type: "bytes" }], l.data as Hex);
      const amount = hexToBigInt(l.topics[3] as Hex);
      return { userAddress, pk, option: option.slice(2) as string, amount };
    });
}

export async function getMerkleProof({
  contractAddress,
  userAddress,
}: {
  contractAddress: `0x${string}`;
  userAddress: Address;
}) {
  const contractAddrLowerCase = contractAddress.toLowerCase();
  const userAddressLowerCase = userAddress.toLowerCase();
  try {
    const merkleProofs = await db
      .select({ merkleProofs: proofs.merkleProofs })
      .from(proofs)
      .where(
        and(
          eq(proofs.userAddress, userAddressLowerCase),
          eq(proofs.contractAddress, contractAddrLowerCase)
        )
      )
      .limit(1);
    const proofArray = merkleProofs[0]?.merkleProofs ?? [];
    return { success: true, data: proofArray };
  } catch (error) {
    console.error("Error fetching merkle proofs from DB", error);
    return { success: false, error: "Error Fetching Merkle Proofs" };
  }
}

export async function verifyMarket(txHash: `0x${string}`) {
  const receipt = await getTransactionReceipt(config as any, {
    hash: txHash,
  });
  const logs = receipt.logs.at(-1);
  if (!logs) {
    return {
      success: false,
      error: "No logs found in transaction",
    };
  }
  const _factoryPredictionMarketAddr = getAddress(logs.address);
  if (
    _factoryPredictionMarketAddr.toLowerCase() !=
    PREDICT_MARKET_FACTORY_ADDRESS.toLowerCase()
  ) {
    return {
      success: false,
      error: "Factory prediction market address mismatch",
    };
  }

  const _marketId = hexToBigInt(logs?.topics[1] as Hex);
  const _predictionMarketAddr = await getAddrFromABIEncoded(
    logs?.topics[2] as `0x${string}`
  );

  const data = await getDataFromMarket(_predictionMarketAddr, "getPrediction");
  console.log({ _predictionMarketAddr });
  console.log(data.oracle, data.question, data.description);

  const [secretRow] = await db
    .select({ contractAddress: secrets.contractAddress })
    .from(secrets)
    .where(eq(secrets.marketId, _marketId))
    .limit(1);

  const secretContractAddr = secretRow?.contractAddress ?? "";
  if (!secretContractAddr) {
    return {
      success: false,
      error: "No secrets entry or contractAddress for marketId",
      marketId: _marketId,
    };
  }
  if (data.oracle.toLowerCase() !== secretContractAddr.toLowerCase()) {
    console.log({ secretContractAddr });
    return {
      success: false,
      error: "Oracle address mismatch with secrets.contractAddress",
    };
  }
  await db.insert(predictionMarkets).values({
    marketId: _marketId,
    marketAddress: _predictionMarketAddr,
    question: data.question ?? "",
    description: data.description ?? "",
  });

  return { success: true, data: _predictionMarketAddr };
}

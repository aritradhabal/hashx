"use server";
import { db } from "@/db/index";
import { secrets } from "@/db/schema";
import {
  CREATEVOTE_FACTORY_ADDRESS,
  HBAR_LOCKING_CONTRACT_ADDRESS,
} from "@/constants";
import { eq, and, lte, gte, lt, gt, asc, desc } from "drizzle-orm";
import { getTransactionReceipt } from "@wagmi/core";
import { config } from "@/utils/WagmiConfig";
import { Address, Hex, hexToBigInt } from "viem";
import { decodeAbiParameters, getAddress } from "viem";
import { readContract } from "@wagmi/core";
import { CreateVoteContractConfig } from "@/utils/contracts";

export interface secretParamsT {
  marketId: bigint;
  N: `0x${string}`;
  t: bigint;
  a: number;
  skLocked: `0x${string}`;
  hashedSK: `0x${string}`;
  publicKey: `0x${string}`;
  secretKey: `0x${string}`;
  verified: boolean;
  server: boolean;
}

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
}
export type VoteCardData = {
  marketId: string;
  title: string;
  description: string;
  rewards: string;
  optionATitle: string;
  optionBTitle: string;
  startTimestamp: string;
  endTimestamp: string;
  contractAddress: string | null;
  verified: boolean;
  server: boolean;
  pp: {
    N: string;
    t: string;
    a: number;
    skLocked: string;
    hashedSK: string;
    publicKey: string;
  };
  tallies: {
    optionA: string;
    optionB: string;
  };
  data: {
    solver: string | null;
    unlockedSecret: string | null;
    resolvedOption: bigint | null;
  };
};
type ReadMap = {
  getPublicParameters: ppT;
  getVoteConfig: VoteConfigT;
  getSolver: string;
  getUnlockedSK: string;
};

export async function getAddrFromABIEncoded(paddedAddr: `0x${string}`) {
  const [rawAddress] = decodeAbiParameters(
    [{ type: "address" }],
    paddedAddr as `0x${string}`
  );
  const checksummedAddress = getAddress(rawAddress);
  return checksummedAddress;
}

const getDataFromContract = async <F extends keyof ReadMap>(
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
    })
    .where(eq(secrets.marketId, _marketId));

  return {
    success: true,
    contractAddress: _deployedContractAddr,
    marketId: _marketId,
  };
}

const _marketTitle = "Who will win the election?";
const _marketDescription =
  "Source: https://www.google.com and https://nytimes.com after 10 days of voting for each option";
const toVoteCardData = (row: {
  marketId: bigint;
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
  title: _marketTitle,
  description: _marketDescription,
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
  const solver = await getDataFromContract(contractAddress, "getSolver");
  const unlockedSecret = await getDataFromContract(
    contractAddress,
    "getUnlockedSK"
  );

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

"use server";
import { db } from "@/db";
import { proofs } from "@/db/schema";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
const ZERO_BYTES32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
export type VoterEntry = { address: string; amount: bigint };

export async function buildMerkleFromVoters(voters: VoterEntry[]) {
  if (voters.length === 0) {
    return {
      root: ZERO_BYTES32,
      proofsByAddress: {},
      tree: null,
    };
  }

  const entries: [string, bigint][] = voters.map((v) => [v.address, v.amount]);
  const tree = StandardMerkleTree.of(entries, ["address", "uint256"]);

  const proofsByAddress = new Map<string, string[]>();
  for (const [i, v] of tree.entries()) {
    const addr = (v[0] as string).toLowerCase();
    proofsByAddress.set(addr, tree.getProof(i));
  }

  return {
    root: tree.root,
    proofsByAddress: Object.fromEntries(proofsByAddress),
    tree,
  };
}

export async function buildWinnerLoserMerkles(
  winners: VoterEntry[],
  losers: VoterEntry[],
  contractAddress: string
) {
  const w = await buildMerkleFromVoters(winners);
  const l = await buildMerkleFromVoters(losers);

  const winnerProofsByAddress = w.proofsByAddress;
  const loserProofsByAddress = l.proofsByAddress;
  console.log("winnerProofsByAddress", winnerProofsByAddress);
  console.log("loserProofsByAddress", loserProofsByAddress);
  const winnerRows = Object.entries(winnerProofsByAddress).map(
    ([userAddress, merkleProofs]) => ({
      userAddress,
      contractAddress,
      merkleProofs,
    })
  );
  const loserRows = Object.entries(loserProofsByAddress).map(
    ([userAddress, merkleProofs]) => ({
      userAddress,
      contractAddress,
      merkleProofs,
    })
  );
  const allRows = [...winnerRows, ...loserRows];
  console.log("allRows", allRows);
  if (allRows.length > 0) {
    await db.insert(proofs).values(allRows);
  }
  return {
    winnerRoot: w.root,
  };
}

"use server";
import { db } from "@/db";
import { proofs } from "@/db/schema";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

export type VoterEntry = { address: string; amount: bigint };

export async function buildMerkleFromVoters(voters: VoterEntry[]) {
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

  await db.insert(proofs).values(allRows);
  return {
    winnerRoot: w.root,
    loserRoot: l.root,
  };
}

"use server";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hederaTestnet } from "viem/chains";

export async function getWalletClient() {
  const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}` | undefined;
  if (!PRIVATE_KEY) throw new Error("PRIVATE_KEY not set");
  const account = privateKeyToAccount(PRIVATE_KEY);
  return createWalletClient({
    account,
    chain: hederaTestnet,
    transport: http(),
  });
}

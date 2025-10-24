import { createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hederaTestnet } from "viem/chains";

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
export const walletClient = createWalletClient({
  account,
  chain: hederaTestnet,
  transport: http(),
});



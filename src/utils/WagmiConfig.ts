import { createConfig, http } from "wagmi";
import { hederaTestnet } from "wagmi/chains";
const HederaTestnetRpcUrl = process.env.HEDERA_TESTNET_RPC_URL;
export const config = createConfig({
  chains: [hederaTestnet],

  transports: {
    [hederaTestnet.id]: http(HederaTestnetRpcUrl),
  },
});

import { createPublicClient } from "viem";
export const viemClient = createPublicClient({
  chain: hederaTestnet,
  transport: http(),
});

import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { injectedWallet, metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";

import { createConfig, http } from "wagmi";
import { hederaTestnet } from "wagmi/chains";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [injectedWallet, metaMaskWallet],
    },
  ],
  {
    appName: "HashX",
    projectId: "f6f0263e0b4fe93aac91f93715ca82e7",
  }
);

export const RainbowkitConfig = createConfig({
  connectors,
  chains: [hederaTestnet],
  ssr: true,
  transports: {
    [hederaTestnet.id]: http(),
  },
});

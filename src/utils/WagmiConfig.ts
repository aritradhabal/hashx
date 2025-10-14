import { createConfig, http } from "wagmi";
import { hederaTestnet } from "wagmi/chains";

export const config = createConfig({
  chains: [hederaTestnet],
  transports: {
    [hederaTestnet.id]: http(),
  },
});

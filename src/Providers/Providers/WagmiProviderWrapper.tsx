"use client";
import { WagmiProvider } from "wagmi";
import { RainbowkitConfig } from "@/utils/RainbowkitConfig";

export function WagmiProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WagmiProvider config={RainbowkitConfig}>{children}</WagmiProvider>;
}

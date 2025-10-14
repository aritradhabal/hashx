"use client";
import { WagmiProviderWrapper } from "@/Providers/Providers/WagmiProviderWrapper";
import { QueryProvider } from "@/Providers/Providers/QueryProvider";
import { RainbowkitProviders } from "@/Providers/Providers/RainbowkitProviders";
import { AccountConnectionProvider } from "@/Providers/Providers/AccountConnectionProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AccountConnectionProvider>
      <WagmiProviderWrapper>
        <QueryProvider>
          <RainbowkitProviders>
            {children}
          </RainbowkitProviders>
        </QueryProvider>
      </WagmiProviderWrapper>
    </AccountConnectionProvider>
  );
}

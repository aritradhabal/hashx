"use client";
import { WagmiProviderWrapper } from "@/Providers/Providers/WagmiProviderWrapper";
import { QueryProvider } from "@/Providers/Providers/QueryProvider";
import { RainbowkitProviders } from "@/Providers/Providers/RainbowkitProviders";
import { BalanceUpdaterProvider } from "@/Providers/Providers/BalanceUpdaterProvider";
import { AccountConnectionProvider } from "@/Providers/Providers/AccountConnectionProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AccountConnectionProvider>
      <WagmiProviderWrapper>
        <QueryProvider>
          <RainbowkitProviders>
            <BalanceUpdaterProvider>{children}</BalanceUpdaterProvider>
          </RainbowkitProviders>
        </QueryProvider>
      </WagmiProviderWrapper>
    </AccountConnectionProvider>
  );
}

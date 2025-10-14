"use client";
import {
  darkTheme,
  RainbowKitAuthenticationProvider,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { createAuthenticationAdapter } from "@rainbow-me/rainbowkit";
import { createSiweMessage } from "viem/siwe";
import { useContext, useMemo } from "react";
import { getNonce, verify } from "@/app/actions/verification";
import { IsAccountConnectedContext } from "./AccountConnectionProvider";

export function RainbowkitProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAccountConnected, setIsAccountConnected } = useContext(
    IsAccountConnectedContext
  );

  const authenticationAdapter = useMemo(
    () =>
      createAuthenticationAdapter({
        getNonce: async () => await getNonce(),
        createMessage: ({ nonce, address, chainId }) =>
          createSiweMessage({
            domain: window.location.host,
            address,
            issuedAt: new Date(),
            expirationTime: new Date(Date.now() + 10 * 60 * 1000),
            statement: "Sign in to HashX",
            uri: window.location.origin,
            version: "1",
            chainId,
            nonce,
          }),
        verify: async ({ message, signature }) => {
          const verifyRes = await verify(message, signature);
          setIsAccountConnected(verifyRes);
          return verifyRes;
        },
        signOut: async () => setIsAccountConnected(false),
      }),
    [setIsAccountConnected]
  );

  return (
    <RainbowKitAuthenticationProvider
      adapter={authenticationAdapter}
      status={isAccountConnected ? "authenticated" : "unauthenticated"}
    >
      <RainbowKitProvider
        modalSize="compact"
        theme={darkTheme({
          accentColor: "#b91c1c",
          accentColorForeground: "white",
          borderRadius: "small",
          fontStack: "system",
          overlayBlur: "small",
        })}
        initialChain={0}
        appInfo={{ appName: "HashX" }}
      >
        {children}
      </RainbowKitProvider>
    </RainbowKitAuthenticationProvider>
  );
}

"use client";
import { createContext, useState } from "react";

export const IsAccountConnectedContext = createContext<{
  isAccountConnected: boolean;
  setIsAccountConnected: (value: boolean) => void;
}>({
  isAccountConnected: false,
  setIsAccountConnected: () => {},
});

export function AccountConnectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAccountConnected, setIsAccountConnected] = useState(false);

  return (
    <IsAccountConnectedContext
      value={{ isAccountConnected, setIsAccountConnected }}
    >
      {children}
    </IsAccountConnectedContext>
  );
}

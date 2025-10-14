"use client";
import { createContext, useState } from "react";

export const BalanceupdaterContext = createContext<{
  balanceupdaterHook: number;
  setBalanceupdaterHook: (value: number) => void;
}>({
  balanceupdaterHook: 1,
  setBalanceupdaterHook: () => {},
});

export function BalanceUpdaterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [balanceupdaterHook, setBalanceupdaterHook] = useState(1);

  return (
    <BalanceupdaterContext
      value={{ balanceupdaterHook, setBalanceupdaterHook }}
    >
      {children}
    </BalanceupdaterContext>
  );
}

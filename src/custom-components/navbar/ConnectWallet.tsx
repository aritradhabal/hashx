"use client";
import React, { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { IoLogIn } from "react-icons/io5";
import { GiMoneyStack } from "react-icons/gi";
import { UserPen } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useConnectModal,
  useAccountModal,
  useChainModal,
} from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import delay from "@/utils/delay";
import { IsAccountConnectedContext } from "@/Providers/Providers/AccountConnectionProvider";
import { BalanceupdaterContext } from "@/Providers/Providers/BalanceUpdaterProvider";

const ConnectWallet = () => {
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();
  const { isAccountConnected, setIsAccountConnected } = useContext(
    IsAccountConnectedContext
  );
  const account = useAccount();
  const [balance, setBalance] = useState(0);
  const address = "0x1234567890123456789012345678901234567890" as `0x${string}`;
  const { balanceupdaterHook } = useContext(BalanceupdaterContext);
  const [waitTime, setwaitTime] = useState(true);
  const { disconnect } = useDisconnect();
  useEffect(() => {
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    delay(350).then(() => {
      setwaitTime(false);
    });
  }, []);
  useEffect(() => {
    setBalance(100);
  }, [balanceupdaterHook]);

  const switchChain = async () => {
    if (!window.ethereum) return;
    const chainId = "0x128";
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }],
      });
      toast.success("Switched to Hedera Testnet");
      return true;
    } catch (err: any) {
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId,
                chainName: "Hedera Testnet",
                nativeCurrency: {
                  name: "HBAR",
                  symbol: "HBAR",
                  decimals: 18,
                },
                rpcUrls: ["https://testnet.hashio.io/api"],
                blockExplorerUrls: ["https://hashscan.io/testnet"],
                iconUrls: ["https://hedera.com/favicon.ico"],
              },
            ],
          });
          toast.success("Hedera Testnet added");
          return true;
        } catch (addErr: any) {
          if (addErr.code === 4001) {
            toast.error("Add Hedera Testnet to Your Wallet to proceed");
          }
          return false;
        }
      } else {
        toast.error("Switch chain failed, check console");
        console.error("Switch chain failed", err);
        return false;
      }
    }
  };

  return (
    <>
      <Button variant={"noEffect"}>
        <p className="cursor-pointer" onClick={openChainModal}>
          <GiMoneyStack />
        </p>
        <Skeleton className="bg-background">
          <p className="cursor-pointer">0.00 &#8463;</p>
        </Skeleton>
      </Button>

      {waitTime ? (
        <Button size={"sm"} disabled>
          <Spinner />
          Loading...
        </Button>
      ) : isAccountConnected ? (
        <Button
          size={"sm"}
          onClick={() => {
            setIsAccountConnected(false);
            disconnect();
          }}
        >
          Sign Out
          <IoLogIn />
        </Button>
      ) : account.isConnected ? (
        <Button
          size={"sm"}
          onClick={async () => {
            const isChainSwitched = await switchChain();
            if (!isChainSwitched) return;
            await delay(350);
            openConnectModal?.();
          }}
        >
          <UserPen />
          Sign In
        </Button>
      ) : (
        <Button
          size={"sm"}
          onClick={async () => {
            const isChainSwitched = await switchChain();
            if (!isChainSwitched) return;
            await delay(350);
            openConnectModal?.();
          }}
        >
          <IoLogIn />
          Sign In
        </Button>
      )}
    </>
  );
};

export default ConnectWallet;

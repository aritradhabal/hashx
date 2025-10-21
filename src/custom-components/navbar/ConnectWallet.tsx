"use client";
import React, { useContext, useEffect, useEffectEvent } from "react";
import { Button } from "@/components/ui/button";
import { IoLogIn } from "react-icons/io5";
import { GiMoneyStack } from "react-icons/gi";
import { TbSignature } from "react-icons/tb";
import { Skeleton } from "@/components/ui/skeleton";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import delay from "@/utils/delay";
import { IsAccountConnectedContext } from "@/Providers/Providers/AccountConnectionProvider";
import { useNativeBalanceStore } from "@/store/useNativeBalanceStore";
const ConnectWallet = () => {
  const { openConnectModal } = useConnectModal();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { isAccountConnected, setIsAccountConnected } = useContext(
    IsAccountConnectedContext
  );

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

  const {
    setAddress,
    balance: balanceOfHBAR,
    isLoading: isBalanceLoading,
    fetchBalance,
  } = useNativeBalanceStore();

  const initilizeNativeBalance = useEffectEvent(
    (address: `0x${string}` | undefined) => {
      if (address) {
        setAddress(address);
        fetchBalance();
      }
    }
  );
  useEffect(() => {
    initilizeNativeBalance(address);
  }, [address]);

  return (
    <>
      <Button variant={"noEffect"} size="sm">
        {isBalanceLoading ? (
          <>
            <Skeleton className="bg-background flex flex-row justify-center items-center gap-x-2">
              <GiMoneyStack />
              <p className="cursor-default">{balanceOfHBAR} &#8463;</p>
            </Skeleton>
          </>
        ) : (
          <>
            <p className="cursor-default">
              <GiMoneyStack />
            </p>
            <p className="cursor-default"> {balanceOfHBAR} &#8463;</p>
          </>
        )}
      </Button>

      {isAccountConnected ? (
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
      ) : address ? (
        <Button
          size={"sm"}
          onClick={async () => {
            const isChainSwitched = await switchChain();
            if (!isChainSwitched) return;
            await delay(350);
            openConnectModal?.();
          }}
        >
          <TbSignature />
          Verify
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

"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemTitle,
} from "@/components/ui/item";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { RiPerplexityFill } from "react-icons/ri";
import { FaXTwitter } from "react-icons/fa6";
import { Spinner } from "@/components/ui/spinner";
import {
  useAccount,
  useSignTypedData,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  getActiveVotes,
  updatePuzzleData,
  getResolvedVotes,
  getUpcomingVotes,
  getDataFromContract,
  getAllCastedVotes,
  getMerkleProof,
} from "@/actions/db-actions";
import type { VoteCardData } from "@/actions/types";
import { keccak256 } from "viem";
type TabValue = "Ongoing" | "Resolved" | "Upcoming";
import { CREATEVOTE_ABI } from "@/constants";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { RainbowkitConfig } from "@/utils/RainbowkitConfig";
import { useChainId } from "wagmi";
import { encrypt } from "@/actions/encryptVote";
import { verifyVoteSignature } from "@/app/actions/verification";
import { useTokenBalanceStore } from "@/store/useTokenBalanceStore";
import { useNativeBalanceStore } from "@/store/useNativeBalanceStore";
import Link from "next/link";

interface CastVoteArgs {
  userPublicKey: bigint;
  option: string | null;
  amount: bigint;
}
export const VoteActionDialog = ({
  option,
  contractAddress,
  marketId,
  rewards,
  publicKey,
  optionValue,
}: {
  option: string;
  contractAddress: string;
  marketId: string;
  rewards: string;
  publicKey: string;
  optionValue: string;
}) => {
  const chainId = useChainId();
  const { signTypedDataAsync } = useSignTypedData();
  const { writeContractAsync } = useWriteContract();
  const [amount, setAmount] = useState<number>(0);
  const { address } = useAccount();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isGenerateBtnClicked, setIsGenerateBtnClicked] = useState(false);
  const [isSubmitBtnClicked, setIsSubmitBtnClicked] = useState(false);
  const [isAnyBtnClicked, setIsAnyBtnClicked] = useState(false);
  const [toastId, setToastId] = useState<string | number>();
  const [toastId2, setToastId2] = useState<string | number>();
  const [args, setArgs] = useState<CastVoteArgs>({
    userPublicKey: BigInt(0),
    option: null,
    amount: BigInt(0),
  });
  const [typedSig, setTypedSig] = useState<`0x${string}` | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const { isSuccess: isConfirmed, isError } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
    query: {
      enabled: !!txHash,
    },
  });
  const { fetchBalance: fetchNativeBalance } = useNativeBalanceStore();
  const { balance: stakedTokenBalance, fetchBalance: fetchTokenBalance } =
    useTokenBalanceStore();
  useEffect(() => {
    const updateData = async () => {
      if (isConfirmed === false && isError === false) return;
      if (isError) {
        toast.error("Transaction failed", {
          duration: 3500,
          action: {
            label: "View on Explorer",
            onClick: () => {
              window.open(
                `https://hashscan.io/testnet/transaction/${txHash}`,
                "_blank"
              );
            },
          },
        });
        setDialogOpen(false);
        setIsGenerateBtnClicked(false);
        setIsSubmitBtnClicked(false);
        setIsAnyBtnClicked(false);
        setAmount(0);
        setArgs({
          userPublicKey: BigInt(0),
          option: null,
          amount: BigInt(0),
        });
        setTypedSig(null);
        setTxHash(null);
        toast.dismiss(toastId);
        toast.dismiss(toastId2);
      }
      if (isConfirmed) {
        toast.success("Transaction Successful", {
          duration: 3500,
          action: {
            label: "View on Explorer",
            onClick: () => {
              window.open(
                `https://hashscan.io/testnet/transaction/${txHash}`,
                "_blank"
              );
            },
          },
        });
        setDialogOpen(false);
        setIsGenerateBtnClicked(false);
        setIsSubmitBtnClicked(false);
        setIsAnyBtnClicked(false);
        setAmount(0);
        setArgs({
          userPublicKey: BigInt(0),
          option: null,
          amount: BigInt(0),
        });
        setTypedSig(null);
        setTxHash(null);
        toast.dismiss(toastId);
        toast.dismiss(toastId2);
      }

      fetchNativeBalance();
      fetchTokenBalance();
    };
    updateData();
  }, [isConfirmed, txHash, isError]);

  const generateVote = async () => {
    setIsGenerateBtnClicked(true);
    setIsAnyBtnClicked(true);
    const sig = await signTypedDataAsync({
      domain: {
        name: "HashX",
        version: "1",
        chainId,
        verifyingContract: contractAddress as `0x${string}`,
      },
      types: {
        Vote: [
          { name: "marketId", type: "uint256" },
          { name: "option", type: "string" },
          { name: "amount", type: "uint256" },
        ],
      },
      primaryType: "Vote",
      message: {
        marketId: BigInt(marketId),
        option,
        amount: BigInt(amount),
      },
    });
    const ok = await verifyVoteSignature({
      signature: sig as `0x${string}`,
      expectedSigner: address as `0x${string}`,
      contractAddress: contractAddress as `0x${string}`,
      chainId,
      marketId: BigInt(marketId),
      option,
      amount: BigInt(amount),
    });

    if (!ok) {
      setIsGenerateBtnClicked(false);
      toast.error("Signature verification failed");
      return;
    }
    toast.success("Signature verified");
    setTypedSig(sig as `0x${string}`);
    const { encryptedVote, userPublicKey } = await encrypt({
      sig: sig as `0x${string}`,
      optionValue: optionValue,
      publicKey: publicKey,
    });
    setArgs((prev) => ({
      ...prev,
      amount: BigInt(amount * 1e8),
      option: encryptedVote,
      userPublicKey: userPublicKey,
    }));
    setIsGenerateBtnClicked(false);
  };

  const maxTokens = Number(stakedTokenBalance);

  const submitVote = async () => {
    setIsSubmitBtnClicked(true);
    const toastId = toast.loading("Submitting vote...", { duration: 3500 });
    setToastId(toastId);

    try {
      const txHash = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: CREATEVOTE_ABI,
        functionName: "castVote",
        args: [args.userPublicKey, args.option, args.amount],
      });
      setTxHash(txHash);
      const toastId2 = toast.loading("Transaction confirming...", {
        duration: 10000,
        action: {
          label: "View on Explorer",
          onClick: () => {
            window.open(
              `https://hashscan.io/testnet/transaction/${txHash}`,
              "_blank"
            );
          },
        },
      });
      setToastId2(toastId2);
    } catch (error) {
      toast.error("Transaction failed. Try again later.", {
        id: toastId,
      });
    } finally {
      setIsSubmitBtnClicked(false);
      setDialogOpen(false);
      setTypedSig(null);
      setIsAnyBtnClicked(false);
      setArgs({
        userPublicKey: BigInt(0),
        option: null,
        amount: BigInt(0),
      });
    }
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <p className="tracking-wide">{option}</p>
          </Button>
        </DialogTrigger>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Submit &#8220;{option}&#8221; Vote</DialogTitle>
            <DialogDescription>Vote ID: {marketId}</DialogDescription>
          </DialogHeader>

          <Card className="w-full bg-background rounded-md">
            <CardHeader>
              <CardTitle>
                Total Reward in &#8463;: {Number(BigInt(rewards) / BigInt(1e8))}
              </CardTitle>
              <CardDescription className="text-xs">
                Voting Rewards will be distributed in proportion voters balance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                placeholder="Amount"
                disabled={isAnyBtnClicked}
                value={amount > 0 ? amount : ""}
                onChange={(e) => {
                  setAmount(Number(e.target.value));
                }}
              />
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-center gap-y-5">
              <CardAction className="w-full flex flex-row items-center justify-center gap-x-2">
                <Button
                  variant={"outline"}
                  onClick={() => {
                    setAmount(amount - 10);
                  }}
                  disabled={amount - 10 < 0 || isAnyBtnClicked}
                >
                  <FaMinus />
                </Button>
                <Button
                  variant={"outline"}
                  disabled={isAnyBtnClicked}
                  onClick={() => {
                    setAmount(maxTokens);
                  }}
                >
                  Maximum
                </Button>
                <Button
                  variant={"outline"}
                  onClick={() => {
                    setAmount(amount + 10);
                  }}
                  disabled={amount + 10 > maxTokens || isAnyBtnClicked}
                >
                  <FaPlus />
                </Button>
              </CardAction>
            </CardFooter>
          </Card>

          <DialogFooter className="flex flex-row items-center !justify-between gap-x-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            {!typedSig ? (
              <Button
                onClick={generateVote}
                disabled={
                  isGenerateBtnClicked || isSubmitBtnClicked || amount <= 0
                }
                className="transition-all duration-300"
              >
                {isGenerateBtnClicked ? (
                  <>
                    <Spinner />
                    Generating...
                  </>
                ) : (
                  "Generate Signature"
                )}
              </Button>
            ) : (
              <Button
                onClick={submitVote}
                disabled={isSubmitBtnClicked || amount <= 0}
                className="transition-all duration-300"
              >
                {isSubmitBtnClicked ? (
                  <>
                    <Spinner />
                    Submitting...
                  </>
                ) : (
                  "Submit Vote"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

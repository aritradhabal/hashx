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
import { useTokenBalanceStore } from "@/store/useTokenBalanceStore";
import { VoteActionDialog } from "./VoteActionDialog";
import { DetailsDialog } from "./DetailsDialog";

export const VoteCard = ({
  optionA,
  optionB,
  optionAValue,
  optionBValue,
  title,
  description,
  showBadges,
  N,
  t,
  a,
  skLocked,
  publicKey,
  rewards,
  marketId,
  server,
  hashedSK,
  contractAddress,
  solver,
  unlockedSecret,
  setOngoing,
  setResolved,
  setUpcoming,
  activeTab,
  timeleft,
}: {
  optionA: string;
  optionB: string;
  optionAValue: string;
  optionBValue: string;
  title: string;
  description: string;
  showBadges?: boolean;
  N: string;
  t: string;
  a: number;
  skLocked: string;
  publicKey: string;
  rewards: string;
  marketId: string;
  server: boolean;
  hashedSK: string;
  contractAddress: string;
  solver: string;
  unlockedSecret: string;
  setOngoing: (votes: VoteCardData[]) => void;
  setResolved: (votes: VoteCardData[]) => void;
  setUpcoming: (votes: VoteCardData[]) => void;
  activeTab: TabValue;
  timeleft?: number;
}) => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const formatTimeLeft = (totalSeconds: number) => {
    const t = Math.max(0, Math.floor(totalSeconds));
    const days = Math.floor(t / 86400);
    const hours = Math.floor((t % 86400) / 3600);
    const minutes = Math.floor((t % 3600) / 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
    return parts.join(" ");
  };
  const [resolvedOption, setResolvedOption] = useState<bigint | undefined>();

  const [isVerifyingResult, setIsVerifyingResult] = useState(false);
  const [isClaimingRewards, setIsClaimingRewards] = useState(false);
  const [txHashForClaim, setTxHashForClaim] = useState<`0x${string}`>();
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [toastIdClaim, setToastIdClaim] = useState<string | number>(
    "verify-or-claim-toast"
  );
  const { fetchBalance: fetchTokenBalance } = useTokenBalanceStore();
  const { isSuccess, isError } = useWaitForTransactionReceipt({
    hash: txHashForClaim as `0x${string}`,
    query: {
      enabled: !!txHashForClaim,
    },
  });

  useEffect(() => {
    if (!isSuccess && !isError) return;
    const checkTxHashForClaimStatus = async () => {
      if (isSuccess) {
        toast.success("Transaction Successful", {
          duration: 3500,
          id: toastIdClaim,
          action: {
            label: "View on Explorer",
            onClick: () => {
              window.open(
                `https://hashscan.io/testnet/transaction/${txHashForClaim}`,
                "_blank"
              );
            },
          },
        });
        setBtnDisabled(false);
        setIsVerifyingResult(false);
        setIsClaimingRewards(false);
        fetchTokenBalance();
      }
      if (isError) {
        toast.error("Transaction Failed", {
          duration: 3500,
          id: toastIdClaim,
          action: {
            label: "View on Explorer",
            onClick: () => {
              window.open(
                `https://hashscan.io/testnet/transaction/${txHashForClaim}`,
                "_blank"
              );
            },
          },
        });
        setBtnDisabled(false);
        setIsVerifyingResult(false);
        setIsClaimingRewards(false);
        fetchTokenBalance();
      }
    };
    checkTxHashForClaimStatus();
  }, [txHashForClaim, isSuccess, isError]);

  const claimRewards = async () => {
    setIsClaimingRewards(true);
    setBtnDisabled(true);
    const { success, data } = await getMerkleProof({
      contractAddress: contractAddress as `0x${string}`,
      userAddress: address as `0x${string}`,
    });
    if (!success) {
      toast.error("Error fetching merkle proof", {
        id: toastIdClaim,
        duration: 3500,
      });
      setIsClaimingRewards(false);
      setBtnDisabled(false);
      return;
    } else {
      if (!Array.isArray(data) || data.length === 0) {
        toast.error("No merkle proof found", {
          description: "Your voted option has not been selected as the winner.",
          id: toastIdClaim,
          duration: 5000,
        });
      }
      const txHash = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: CREATEVOTE_ABI,
        functionName: "claimRewards",
        args: [data],
      });
      setTxHashForClaim(txHash);
      toast.loading("Transaction Submitted...", {
        id: toastIdClaim,
        duration: 10000,
        action: {
          label: "View on Explorer",
          onClick: () => {
            window.open(
              `https://hashscan.io/testnet/transaction/${txHashForClaim}`,
              "_blank"
            );
          },
        },
      });
    }
  };
  const verifyResult = async () => {
    setIsVerifyingResult(true);
    setBtnDisabled(true);
    const { resolvedOption } = await getDataFromContract(
      contractAddress as `0x${string}`,
      "getVoteData"
    );
    if (resolvedOption !== 0n) {
      toast.success("Vote Resolved", {
        duration: 3500,
        id: toastIdClaim,
      });
      setResolvedOption(resolvedOption);
      setIsVerifyingResult(false);
      setBtnDisabled(false);
      return;
    } else {
      const { success, data, error } = await getAllCastedVotes(
        contractAddress as `0x${string}`
      );
      if (!success) {
        toast.error(error as string, {
          duration: 2000,
        });
        setIsVerifyingResult(false);
        setBtnDisabled(false);
        return;
      } else {
        setTxHashForClaim(data);
        toast.loading("Transaction Submitted...", {
          id: toastIdClaim,
          duration: 10000,
          action: {
            label: "View on Explorer",
            onClick: () => {
              window.open(
                `https://hashscan.io/testnet/transaction/${txHashForClaim}`,
                "_blank"
              );
            },
          },
        });
        setBtnDisabled(true);
        setBtnDisabled(false);
      }
    }
  };

  return (
    <Item variant="outline" className="w-xs md:w-3xl xl:w-4xl 2xl:w-5xl">
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        <ItemDescription className="flex flex-wrap break-words whitespace-normal">
          {description}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        {activeTab === "Ongoing" && (
          <>
            <VoteActionDialog
              option={optionA}
              contractAddress={contractAddress}
              marketId={marketId}
              rewards={rewards}
              optionValue={optionAValue}
              publicKey={publicKey}
            />
            <VoteActionDialog
              option={optionB}
              contractAddress={contractAddress}
              marketId={marketId}
              rewards={rewards}
              optionValue={optionBValue}
              publicKey={publicKey}
            />
          </>
        )}
        {activeTab === "Resolved" && (
          <>
            {!resolvedOption ? (
              <Button
                variant="outline"
                size="sm"
                onClick={verifyResult}
                disabled={btnDisabled}
              >
                {isVerifyingResult ? (
                  <>
                    {" "}
                    <Spinner /> Verifying Result...
                  </>
                ) : (
                  "Verify Result"
                )}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={claimRewards}
                disabled={btnDisabled}
              >
                {isClaimingRewards ? (
                  <>
                    <Spinner /> Claiming Rewards...
                  </>
                ) : (
                  "Claim Rewards"
                )}
              </Button>
            )}
          </>
        )}
        {activeTab === "Upcoming" && (
          <DetailsDialog
            marketId={marketId}
            N={N}
            t={t}
            a={a}
            skLocked={skLocked}
            publicKey={publicKey}
            server={server}
            hashedSK={hashedSK}
            contractAddress={contractAddress}
            solver={solver}
            unlockedSecret={unlockedSecret}
            setOngoing={setOngoing}
            setResolved={setResolved}
            setUpcoming={setUpcoming}
            activeTab={activeTab}
          />
        )}
      </ItemActions>
      {showBadges && (
        <ItemFooter className="flex flex-row flex-wrap gap-x-2 gap-y-2 justify-between items-center">
          <div className="flex flex-row gap-x-1 items-center justify-center flex-wrap">
            <Badge variant={"noEffect"} asChild>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(
                  title
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FcGoogle /> Google
              </a>
            </Badge>
            <Badge variant={"noEffect"} asChild>
              <a
                href={`https://www.perplexity.ai/search?q=${encodeURIComponent(
                  title
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <RiPerplexityFill /> Perplexity
              </a>
            </Badge>
            <Badge variant={"noEffect"} asChild>
              <a
                href={`https://www.x.com/search?q=${encodeURIComponent(title)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaXTwitter /> Twitter
              </a>
            </Badge>
          </div>
          <div className="flex flex-row gap-x-3 items-center justify-center flex-wrap">
            {activeTab !== "Upcoming" && (
              <DetailsDialog
                marketId={marketId}
                N={N}
                t={t}
                a={a}
                skLocked={skLocked}
                publicKey={publicKey}
                server={server}
                hashedSK={hashedSK}
                contractAddress={contractAddress}
                solver={solver}
                unlockedSecret={unlockedSecret}
                setOngoing={setOngoing}
                setResolved={setResolved}
                setUpcoming={setUpcoming}
                activeTab={activeTab}
              />
            )}

            {(activeTab === "Ongoing" || activeTab === "Upcoming") && (
              <Badge variant={"noEffect"}>
                {timeleft ? formatTimeLeft(timeleft) : "0m 0s"} Left
              </Badge>
            )}
            <Badge
              variant={"noEffect"}
              className="bg-background text-card-foreground border-background !pl-0"
            >
              Reward: {Math.floor(Number(rewards) / 1e8)} &#8463;
            </Badge>
          </div>
        </ItemFooter>
      )}
    </Item>
  );
};

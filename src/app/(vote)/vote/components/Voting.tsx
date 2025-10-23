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
import { wagmiContractConfig } from "@/utils/contracts";
import { Spinner } from "@/components/ui/spinner";
import {
  useAccount,
  useReadContract,
  useSignMessage,
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
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  getActiveVotes,
  updatePuzzleData,
  getResolvedVotes,
  getUpcomingVotes,
} from "@/actions/db-actions";
import type { VoteCardData } from "@/actions/db-actions";
import { keccak256 } from "viem";
type TabValue = "Ongoing" | "Resolved" | "Upcoming";
import { CREATEVOTE_ABI } from "@/constants";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const Voting = () => {
  const [activeTab, setActiveTab] = React.useState<TabValue>("Ongoing");
  const [ongoing, setOngoing] = useState<VoteCardData[]>([]);
  const [resolved, setResolved] = useState<VoteCardData[]>([]);
  const [upcoming, setUpcoming] = useState<VoteCardData[]>([]);
  const [pendingVotes, setPendingVotes] = useState<number>(0);
  const [resolvedVotes, setResolvedVotes] = useState<number>(0);
  useEffect(() => {
    const fetchContracts = async (activeTab: TabValue) => {
      if (activeTab === "Ongoing") {
        const { success, data } = await getActiveVotes();

        if (success && data) {
          if (data.length != ongoing.length) {
            setOngoing(data);
          }
        }
      }
      if (activeTab === "Resolved") {
        const { success, data } = await getResolvedVotes();
        if (success && data) {
          if (data.length != resolved.length) {
            setResolved(data);
            setResolvedVotes(data.length);
          }
        }
      }
      if (activeTab === "Upcoming") {
        const { success, data } = await getUpcomingVotes();
        if (success && data) {
          if (data.length != upcoming.length) {
            setUpcoming(data);
            setPendingVotes(data.length);
          }
        }
      }
    };
    fetchContracts(activeTab);
  }, [activeTab]);

  return (
    <>
      <div className="h-full w-full flex flex-col justify-start items-center gap-y-5">
        <h2 className="w-xs md:w-xl text-xl md:text-2xl text-center font-bold break-words whitespace-normal pt-2">
          Submit Your Vote and Earn Rewards
        </h2>
        <Item variant="outline" className="w-xs md:w-3xl">
          <ItemContent>
            <ItemTitle>Your Votes</ItemTitle>
            <ItemDescription className="text-xs break-words whitespace-normal">
              Each vote costs 10 &#8463;, you will get rewarded as per the
              voting voting criteria.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant="outline" size="sm">
              Upcoming ({pendingVotes})
            </Button>
            <Button variant="outline" size="sm">
              Resolved ({resolvedVotes})
            </Button>
          </ItemActions>
        </Item>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabValue)}
          className="w-xs md:w-3xl pb-5 flex flex-col items-center justify-center gap-y-5 "
        >
          <TabsList className="w-full">
            <TabsTrigger value="Ongoing" className="cursor-pointer">
              Ongoing
            </TabsTrigger>
            <TabsTrigger value="Resolved" className="cursor-pointer">
              Resolved
            </TabsTrigger>
            <TabsTrigger value="Upcoming" className="cursor-pointer">
              Upcoming
            </TabsTrigger>
          </TabsList>
          <TabsContent value="Ongoing">
            <div className="voting-container h-[60svh] flex flex-col gap-y-2 overflow-y-scroll">
              {ongoing.map((vote) => (
                <VoteCard
                  key={vote.marketId}
                  title={vote.title}
                  description={vote.description}
                  optionA={vote.optionATitle}
                  optionB={vote.optionBTitle}
                  optionAValue={vote.tallies.optionA}
                  optionBValue={vote.tallies.optionB}
                  showBadges={true}
                  N={vote.pp.N}
                  t={vote.pp.t}
                  a={vote.pp.a}
                  skLocked={vote.pp.skLocked}
                  publicKey={vote.pp.publicKey}
                  rewards={vote.rewards}
                  marketId={vote.marketId}
                  server={vote.server}
                  hashedSK={vote.pp.hashedSK}
                  contractAddress={vote.contractAddress as string}
                  solver={
                    vote.data.solver ??
                    "0x0000000000000000000000000000000000000000"
                  }
                  unlockedSecret={
                    vote.data.unlockedSecret ??
                    "0x0000000000000000000000000000000000000000000000000000000000000000"
                  }
                  setOngoing={setOngoing}
                  setResolved={setResolved}
                  setUpcoming={setUpcoming}
                  activeTab={activeTab}
                  timeleft={Number(vote.endTimestamp) - Date.now() / 1000}
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="Resolved">
            <div className="voting-container h-[60svh] flex flex-col gap-y-2 overflow-y-scroll">
              {resolved.map((vote) => (
                <VoteCard
                  key={vote.marketId}
                  title={vote.title}
                  description={vote.description}
                  optionA={vote.optionATitle}
                  optionB={vote.optionBTitle}
                  optionAValue={vote.tallies.optionA}
                  optionBValue={vote.tallies.optionB}
                  showBadges={true}
                  N={vote.pp.N}
                  t={vote.pp.t}
                  a={vote.pp.a}
                  skLocked={vote.pp.skLocked}
                  publicKey={vote.pp.publicKey}
                  rewards={vote.rewards}
                  marketId={vote.marketId}
                  server={vote.server}
                  hashedSK={vote.pp.hashedSK}
                  contractAddress={vote.contractAddress as string}
                  solver={
                    vote.data.solver ??
                    "0x0000000000000000000000000000000000000000"
                  }
                  unlockedSecret={
                    vote.data.unlockedSecret ??
                    "0x0000000000000000000000000000000000000000000000000000000000000000"
                  }
                  setOngoing={setOngoing}
                  setResolved={setResolved}
                  setUpcoming={setUpcoming}
                  activeTab={activeTab}
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="Upcoming">
            <div className="voting-container h-[60svh] flex flex-col gap-y-2 overflow-y-scroll">
              {upcoming.map((vote) => (
                <VoteCard
                  key={vote.marketId}
                  title={vote.title}
                  description={vote.description}
                  optionA={vote.optionATitle}
                  optionB={vote.optionBTitle}
                  optionAValue={vote.tallies.optionA}
                  optionBValue={vote.tallies.optionB}
                  showBadges={true}
                  N={vote.pp.N}
                  t={vote.pp.t}
                  a={vote.pp.a}
                  skLocked={vote.pp.skLocked}
                  publicKey={vote.pp.publicKey}
                  rewards={vote.rewards}
                  marketId={vote.marketId}
                  server={vote.server}
                  hashedSK={vote.pp.hashedSK}
                  contractAddress={vote.contractAddress as string}
                  solver={
                    vote.data.solver ??
                    "0x0000000000000000000000000000000000000000"
                  }
                  unlockedSecret={
                    vote.data.unlockedSecret ??
                    "0x0000000000000000000000000000000000000000000000000000000000000000"
                  }
                  setOngoing={setOngoing}
                  setResolved={setResolved}
                  setUpcoming={setUpcoming}
                  activeTab={activeTab}
                  timeleft={Date.now() / 1000 - Number(vote.startTimestamp)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

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
  return (
    <Item variant="outline" className="w-xs md:w-3xl">
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
          <Button variant="outline" size="sm">
            Claim Rewards
          </Button>
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
            />

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

import delay from "@/utils/delay";
export const DetailsDialog = ({
  N,
  t,
  a,
  skLocked,
  publicKey,
  marketId,
  server,
  hashedSK,
  contractAddress,
  solver,
  unlockedSecret,
  setOngoing,
  setResolved,
  setUpcoming,
}: {
  N: string;
  t: string;
  a: number;
  skLocked: string;
  publicKey: string;
  marketId: string;
  server: boolean;
  hashedSK: string;
  contractAddress: string;
  solver: string;
  unlockedSecret: string;
  setOngoing: (votes: VoteCardData[]) => void;
  setResolved: (votes: VoteCardData[]) => void;
  setUpcoming: (votes: VoteCardData[]) => void;
}) => {
  const router = useRouter();
  const { writeContractAsync } = useWriteContract();
  const [sk_Recovered, setSkRecovered] = useState<`0x${string}`>();
  const [isVerified, setIsVerified] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}`>();
  const [btnClicked, setBtnClicked] = useState(false);
  const [submitBtnClicked, setSubmitBtnClicked] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [PuzzletoastId, setPuzzletoastId] = useState<string | number>();
  const { isSuccess: isConfirmed, isError } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
    query: {
      enabled: !!txHash,
    },
  });

  useEffect(() => {
    if (!isConfirmed) return;
    const updateData = async () => {
      const { success } = await updatePuzzleData(
        contractAddress as `0x${string}`
      );
      if (success) {
        toast.success("Puzzle updated successfully, Refreshing...", {
          duration: 5000,
        });
        await delay(3000);
        window.location.reload();
        toast.dismiss(PuzzletoastId);
        setDialogOpen(false);
        setSkRecovered("0x0000000000000000000000000000000000000000");
        setBtnClicked(false);
        setSubmitBtnClicked(false);
        setIsVerified(false);
        setOngoing([]);
        setResolved([]);
        setUpcoming([]);
      } else {
        toast.error("Failed to update puzzle", { duration: 5000 });
        toast.dismiss(PuzzletoastId);
        setDialogOpen(false);
        setSkRecovered("0x0000000000000000000000000000000000000000");
        setBtnClicked(false);
        setSubmitBtnClicked(false);
        setIsVerified(false);
      }
    };
    updateData();
  }, [isConfirmed]);

  const verifyPuzzle = () => {
    setBtnClicked(true);
    if (!sk_Recovered) return;
    const userKeccakhash = keccak256(sk_Recovered);
    if (userKeccakhash === hashedSK) {
      setIsVerified(true);
    } else {
      setIsVerified(false);
    }
  };
  const submitPuzzleSolution = async () => {
    setSubmitBtnClicked(true);
    const toastId = toast.loading("Submitting Puzzle Solution...", {
      duration: 10000,
    });
    setPuzzletoastId(toastId);
    try {
      const txHash = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: CREATEVOTE_ABI,
        functionName: "verifySecret",
        args: [sk_Recovered],
      });
      setTxHash(txHash);
      toast.loading("Transaction Submitted...", {
        id: PuzzletoastId,
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
      if (isConfirmed || isError) {
        setSubmitBtnClicked(false);
        setBtnClicked(false);
        setDialogOpen(false);
      }
    } catch (error) {
      toast.error("Transaction failed. Try again later.", {
        id: PuzzletoastId,
      });
    }
  };
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger>
        <Badge className="cursor-pointer" variant={"noEffect"}>
          Details
        </Badge>
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Public Parameters</DialogTitle>
          <DialogDescription>Vote ID: {marketId}</DialogDescription>
        </DialogHeader>
        <InputGroup>
          <InputGroupTextarea
            readOnly={true}
            disabled={true}
            value={N}
            id="public-parameters-n"
            className="text-intputs resize-none break-all text-xs font-mono !cursor-text max-h-8 md:max-h-16 overflow-y-scroll "
          />
          <InputGroupAddon align="block-start">
            <Label htmlFor="public-parameters-n" className="text-foreground">
              Modulus (N)
            </Label>
          </InputGroupAddon>
        </InputGroup>
        <div className="w-full flex flex-col md:flex-row gap-x-2 gap-y-2">
          <InputGroup>
            <InputGroupInput
              readOnly={true}
              disabled={true}
              value={a.toString()}
              id="public-parameters-a"
              className="resize-none break-all text-xs font-mono !cursor-text"
            />
            <InputGroupAddon align="block-start">
              <Label htmlFor="public-parameters-a" className="text-foreground">
                Base (a)
              </Label>
            </InputGroupAddon>
          </InputGroup>
          <InputGroup>
            <InputGroupInput
              readOnly={true}
              disabled={true}
              value={t}
              id="public-parameters-t"
              className="resize-none break-all text-xs font-mono !cursor-text"
            />
            <InputGroupAddon align="block-start">
              <Label htmlFor="public-parameters-t" className="text-foreground">
                Time (t)
              </Label>
            </InputGroupAddon>
          </InputGroup>
        </div>
        <InputGroup>
          <InputGroupTextarea
            readOnly={true}
            disabled={true}
            value={skLocked}
            id="public-parameters-sk"
            className="resize-none break-all text-xs font-mono !cursor-text"
          />
          <InputGroupAddon align="block-start">
            <Label htmlFor="public-parameters-sk" className="text-foreground">
              SecretKey (SK_Locked)
            </Label>
          </InputGroupAddon>
        </InputGroup>
        {server === false ? (
          solver === "0x0000000000000000000000000000000000000000" ? (
            <>
              <InputGroup>
                <InputGroupInput
                  value={sk_Recovered ?? ""}
                  onChange={(e) => {
                    setSkRecovered(e.target.value as `0x${string}`);
                  }}
                  disabled={isVerified}
                  id="public-parameters-soln"
                  placeholder="Enter computed puzzle solution"
                  className="resize-none break-all text-xs font-mono !cursor-text"
                />
                <InputGroupAddon align="block-start">
                  <Label
                    htmlFor="public-parameters-soln"
                    className="text-foreground"
                  >
                    Secret Key (SK)
                  </Label>
                </InputGroupAddon>
              </InputGroup>
              <DialogFooter className="flex flex-row flex-wrap !items-center !justify-between">
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
                <div className="flex justify-center items-center gap-2 flex-wrap">
                  <Button
                    type="button"
                    disabled={!sk_Recovered || isVerified}
                    onClick={verifyPuzzle}
                  >
                    {isVerified ? "Verified" : "Verify"}
                  </Button>
                  <Button
                    type="submit"
                    onClick={submitPuzzleSolution}
                    disabled={!isVerified || submitBtnClicked}
                  >
                    {submitBtnClicked ? (
                      <>
                        <Spinner /> Submitting...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </>
          ) : (
            <>
              <InputGroup>
                <InputGroupTextarea
                  readOnly={true}
                  disabled={true}
                  value={unlockedSecret}
                  id="public-parameters-sk"
                  className="resize-none break-all text-xs font-mono !cursor-text"
                />
                <InputGroupAddon align="block-start">
                  <Label
                    htmlFor="public-parameters-sk"
                    className="text-foreground"
                  >
                    Secret Key (SK)
                  </Label>
                </InputGroupAddon>
              </InputGroup>
            </>
          )
        ) : (
          <>
            <InputGroup>
              <InputGroupTextarea
                readOnly={true}
                disabled={true}
                value={publicKey}
                id="public-parameters-public-key"
                className="resize-none break-all text-xs font-mono !cursor-text"
              />
              <InputGroupAddon align="block-start">
                <Label
                  htmlFor="public-parameters-public-key"
                  className="text-foreground"
                >
                  Public Key (PK)
                </Label>
              </InputGroupAddon>
            </InputGroup>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

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
      console.log("redndered");
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

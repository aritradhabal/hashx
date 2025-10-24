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
import Link from "next/link";

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
  activeTab,
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
  activeTab: TabValue;
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
        toast.success("Puzzle Verified, Refreshing...", {
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
      <DialogTrigger asChild>
        {activeTab === "Upcoming" ? (
          <Button variant="outline" size="sm">
            Details
          </Button>
        ) : (
          <Badge className="cursor-pointer" variant={"noEffect"}>
            Details
          </Badge>
        )}
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Public Parameters</DialogTitle>
          <DialogDescription>Vote ID: {marketId}</DialogDescription>
        </DialogHeader>
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <Label
              htmlFor="public-parameters-contract-address"
              className="flex flex-wrap gap-x-2 items-center justify-center cursor-pointer text-foreground"
            >
              <Badge variant="noEffect">Contract</Badge>
              <Link
                href={`https://hashscan.io/testnet/contract/${contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="text-foreground hover:underline">
                  {contractAddress}
                </span>
              </Link>
            </Label>
          </InputGroupAddon>
        </InputGroup>
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
              Encrypted SecretKey
            </Label>
          </InputGroupAddon>
        </InputGroup>
        {solver === "0x0000000000000000000000000000000000000000" ? (
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
        )}
      </DialogContent>
    </Dialog>
  );
};

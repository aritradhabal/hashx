"use client";
import React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Spinner } from "@/components/ui/spinner";
import { useNativeBalanceStore } from "@/store/useNativeBalanceStore";
import { useTokenBalanceStore } from "@/store/useTokenBalanceStore";
import { InfoIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MdQuestionMark } from "react-icons/md";
import { CreateVote } from "./CreateVote";
import { MdPercent } from "react-icons/md";
import { PredictionMarketFactoryContractConfig } from "@/utils/contracts";
import { HBAR_LOCKING_CONTRACT_ADDRESS } from "@/constants";
import { verifyMarket } from "@/actions/db-actions";
export const CreateMarket = () => {
  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [question, setQuestion] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [marketCreateToast, setMarketCreateToast] = useState<string | number>(
    "market-create-toast"
  );
  const [probablity, setProbablity] = useState<number>(0);
  const { isSuccess, isError, isPending, error } = useWaitForTransactionReceipt(
    {
      hash: txHash as `0x${string}`,
      query: {
        enabled: !!txHash,
      },
    }
  );
  const [marketId, setMarketId] = useState<bigint | undefined>(undefined);
  const [contractAddress, setContractAddress] = useState<
    `0x${string}` | undefined
  >(undefined);

  const {
    address,
    balance: stakedTokenBalance,
    fetchBalance: fetchTokenBalance,
  } = useTokenBalanceStore();

  useEffect(() => {
    if (isPending) return;
    const checkMarketCreatTxn = async () => {
      if (isSuccess) {
        console.log("Transaction Hash:", txHash);
        const { success, data, error } = await verifyMarket(
          txHash as `0x${string}`
        );
        toast.success("Transaction completed, Verifying...", {
          id: marketCreateToast,
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
        if (success) {
          toast.success("Event created successfully", {
            id: marketCreateToast,
            duration: 3500,
            action: {
              label: "View on Explorer",
              onClick: () => {
                window.open(
                  `https://hashscan.io/testnet/contract/${data}`,
                  "_blank"
                );
              },
            },
          });
        } else {
          toast.error(error || "Market Verification failed. Try again later.", {
            id: marketCreateToast,
            duration: 3500,
          });
        }
      }
      if (isError) {
        console.log(error);
        toast.error(error?.message || "Transaction failed. Try again later.", {
          id: marketCreateToast,
          duration: 3500,
        });
      }
      setBtnClicked(false);
      setMarketId(undefined);
      setContractAddress(undefined);
      setQuestion("");
      setDescription("");
      setProbablity(0);
      setAmount(0);
      setIsAgreed(false);
      setBtnClicked(false);
      setTxHash(undefined);
    };
    fetchTokenBalance();
    checkMarketCreatTxn();
  }, [isSuccess, isPending, isError]);

  const maxTokens = Number(stakedTokenBalance) - 1;
  const stakedAmount = Number(stakedTokenBalance);
  const [amount, setAmount] = useState(0);
  const [isAgreed, setIsAgreed] = useState(false);
  const [BtnClicked, setBtnClicked] = useState(false);

  const createContract = async () => {
    try {
      setBtnClicked(true);

      const initialTokenValue = BigInt(1e7); // 0.1 whbar
      const initialYesProbability = Math.round(probablity) as number;
      const percentageToLock = initialYesProbability;
      const sEthCollateral = BigInt(amount * 1e8);

      console.log(
        "Market ID:",
        marketId?.toString(),
        "Contract Address:",
        contractAddress?.toString(),
        "Question:",
        question,
        "Description:",
        description,
        "Initial Token Value:",
        initialTokenValue.toString(),
        "HBAR Locking Contract Address:",
        HBAR_LOCKING_CONTRACT_ADDRESS,
        "Initial Yes Probability:",
        initialYesProbability.toString(),
        "Percentage to Lock:",
        percentageToLock.toString(),
        "sEth Collateral:",
        sEthCollateral.toString()
      );
      const hash = await writeContractAsync({
        address: PredictionMarketFactoryContractConfig.address,
        abi: PredictionMarketFactoryContractConfig.abi,
        functionName: "createPredictionMarket",
        args: [
          marketId,
          contractAddress,
          question,
          description,
          initialTokenValue,
          HBAR_LOCKING_CONTRACT_ADDRESS,
          initialYesProbability,
          percentageToLock,
          sEthCollateral,
        ],
      });

      setTxHash(hash);
      toast.loading("Transaction in Progress...", {
        id: marketCreateToast,
        duration: 10000,
        action: {
          label: "View on Explorer",
          onClick: () => {
            window.open(
              `https://hashscan.io/testnet/transaction/${hash}`,
              "_blank"
            );
          },
        },
      });
    } catch (err) {
      console.error(err);
      setBtnClicked(false);
      toast.error("Transaction failed. Try again later.");
    }
  };

  return (
    <div className="h-full w-full flex flex-col justify-center items-center gap-y-10">
      <h2 className="w-xs md:w-sm text-xl md:text-2xl text-center font-bold break-words whitespace-normal text-pretty">
        Create Your Prediction Market Event
      </h2>
      <div className="flex flex-col items-center justify-center gap-y-5">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Initial Liquidity</CardTitle>
            <CardDescription>
              Prediction Market Event Initial Liquidity in &#8463;
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              disabled={marketId && contractAddress ? true : false}
              type="number"
              placeholder="Amount"
              value={amount > 0 ? amount : ""}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center gap-y-5">
            <CardAction className="w-full flex flex-row items-center justify-center gap-x-2">
              <Button
                variant={"outline"}
                onClick={() => setAmount(amount - 10)}
                disabled={
                  amount - 10 < 0 || (marketId && contractAddress)
                    ? true
                    : false
                }
              >
                <FaMinus />
              </Button>
              <Button
                variant={"outline"}
                onClick={() => setAmount(maxTokens)}
                disabled={marketId && contractAddress ? true : false}
              >
                Maximum
              </Button>
              <Button
                variant={"outline"}
                onClick={() => setAmount(amount + 10)}
                disabled={
                  amount + 10 > maxTokens || (marketId && contractAddress)
                    ? true
                    : false
                }
              >
                <FaPlus />
              </Button>
            </CardAction>
            <InputGroup>
              <InputGroupInput
                disabled={marketId && contractAddress ? true : false}
                type="text"
                id="question"
                placeholder="Question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <InputGroupAddon>
                <Label htmlFor="question">
                  <MdQuestionMark />
                </Label>
              </InputGroupAddon>
            </InputGroup>
            <InputGroup>
              <InputGroupInput
                id="description"
                placeholder="The market will be resolved only if..."
                onChange={(e) => setDescription(e.target.value)}
                value={description.length > 0 ? description : ""}
                disabled={marketId && contractAddress ? true : false}
              />
              <InputGroupAddon align="block-start">
                <Label htmlFor="description" className="text-foreground">
                  Resolution Criteria
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InputGroupButton
                      variant="ghost"
                      aria-label="Help"
                      className="ml-auto rounded-full"
                      size="icon-xs"
                    >
                      <InfoIcon />
                    </InputGroupButton>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Provide robust resolution criteria for the market based on
                      which voters will place the votes.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </InputGroupAddon>
            </InputGroup>
            <InputGroup>
              <InputGroupInput
                disabled={marketId && contractAddress ? true : false}
                type="number"
                id="probablity-of-yes"
                placeholder="Initial Probability of Yes"
                value={probablity > 0 ? probablity : ""}
                onChange={(e) => setProbablity(Number(e.target.value))}
              />
              <InputGroupAddon>
                <Label htmlFor="probablity-of-yes">
                  <MdPercent />
                </Label>
              </InputGroupAddon>
            </InputGroup>
            <div className="flex flex-row items-center justify-center gap-x-4">
              <div className="flex flex-row items-center justify-center gap-x-2">
                <Checkbox
                  disabled={marketId && contractAddress ? true : false}
                  id="terms"
                  checked={isAgreed}
                  onCheckedChange={(checked) => setIsAgreed(checked as boolean)}
                />
                <HoverCard>
                  <HoverCardTrigger>
                    <Label htmlFor="terms" className="cursor-pointer">
                      Accept terms and conditions
                    </Label>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-sm text-sm">
                    Stake your tokens to participate in the vote. Vote correctly
                    to get rewarded. Incorrect votes will be penalized.
                  </HoverCardContent>
                </HoverCard>
              </div>
              {marketId && contractAddress ? (
                <Button
                  disabled={
                    !isAgreed ||
                    amount <= 0 ||
                    amount > maxTokens ||
                    BtnClicked ||
                    question.length === 0
                  }
                  onClick={createContract}
                >
                  {BtnClicked ? (
                    <>
                      <Spinner /> Creating Market...
                    </>
                  ) : (
                    "Create Market"
                  )}
                </Button>
              ) : (
                <CreateVote
                  question={question}
                  description={description}
                  setMarketId={setMarketId}
                  setContractAddress={setContractAddress}
                  disabled={
                    !isAgreed ||
                    amount <= 0 ||
                    amount > maxTokens ||
                    BtnClicked ||
                    question.length === 0
                  }
                />
              )}
            </div>
          </CardFooter>
        </Card>
      </div>

      <Item variant="outline" className="w-xs md:w-sm">
        <ItemContent>
          <ItemTitle>Your Stakes</ItemTitle>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm">
            <p className="">{stakedAmount} &#8463;</p>
          </Button>
        </ItemActions>
      </Item>
    </div>
  );
};

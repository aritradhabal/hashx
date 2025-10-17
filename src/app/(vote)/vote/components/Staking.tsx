"use client";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { wagmiContractConfig } from "@/utils/contracts";
import { Spinner } from "@/components/ui/spinner";
import { useTransactionHashStore } from "@/store/useTransactionHashStore";
import { useNativeBalanceStore } from "@/store/useNativeBalanceStore";
import { useTokenBalanceStore } from "@/store/useTokenBalanceStore";

export const Staking = () => {
  const { writeContractAsync } = useWriteContract();
  const { transactionHash, setTransactionHash } = useTransactionHashStore();
  const { isSuccess } = useWaitForTransactionReceipt({
    hash: transactionHash as `0x${string}`,
    query: {
      enabled: !!transactionHash,
    },
  });
  const { balance: nativeBalance, fetchBalance: fetchNativeBalance } =
    useNativeBalanceStore();
  const {
    address,
    balance: stakedTokenBalance,
    fetchBalance: fetchTokenBalance,
  } = useTokenBalanceStore();

  useEffect(() => {
    console.log("rendered1");
    fetchTokenBalance();
  }, [address]);

  useEffect(() => {
    console.log("rendered2");
    if (isSuccess) {
      fetchNativeBalance();
      fetchTokenBalance();
    }
  }, [isSuccess]);

  const maxTokens = Number(nativeBalance);
  const stakedAmount = Number(stakedTokenBalance);
  const [amount, setAmount] = useState(0);
  const [isAgreed, setIsAgreed] = useState(false);
  const [BtnClicked, setBtnClicked] = useState(false);

  return (
    <div className="h-full w-full flex flex-col justify-center items-center gap-y-10">
      <h2 className="w-xs md:w-sm text-xl md:text-2xl text-center font-bold break-words whitespace-normal">
        Stake Your Tokens To Participate In The Vote
      </h2>
      <div className="flex flex-col items-center justify-center gap-y-5">
        <Tabs defaultValue="Stake" className="w-xs md:w-sm">
          <TabsList className="w-full">
            <TabsTrigger value="Stake" className="cursor-pointer">
              Stake
            </TabsTrigger>
            <TabsTrigger value="Unstake" className="cursor-pointer">
              Unstake
            </TabsTrigger>
          </TabsList>
          <TabsContent value="Stake">
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle>Stake &#8463;</CardTitle>
                <CardDescription>
                  Stake your tokens to participate in the vote.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
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
                    disabled={amount - 10 < 0}
                  >
                    <FaMinus />
                  </Button>
                  <Button
                    variant={"outline"}
                    onClick={() => setAmount(maxTokens)}
                  >
                    Maximum
                  </Button>
                  <Button
                    variant={"outline"}
                    onClick={() => setAmount(amount + 10)}
                    disabled={amount + 10 > maxTokens}
                  >
                    <FaPlus />
                  </Button>
                </CardAction>
                <div className="flex flex-row items-center justify-center gap-x-4">
                  <div className="flex flex-row items-center justify-center gap-x-2">
                    <Checkbox
                      id="terms"
                      checked={isAgreed}
                      onCheckedChange={(checked) =>
                        setIsAgreed(checked as boolean)
                      }
                    />
                    <HoverCard>
                      <HoverCardTrigger>
                        <Label htmlFor="terms" className="cursor-pointer">
                          Accept terms and conditions
                        </Label>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-sm text-sm">
                        Stake your tokens to participate in the vote. Vote
                        correctly to get rewarded. Incorrect votes will be
                        penalized.
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                  <Button
                    disabled={
                      !isAgreed ||
                      amount <= 0 ||
                      amount > maxTokens ||
                      BtnClicked
                    }
                    onClick={async () => {
                      setBtnClicked(true);
                      const toastId = toast.loading(
                        "Transaction in progress..."
                      );

                      try {
                        const txHash = await writeContractAsync({
                          address: wagmiContractConfig.address,
                          abi: wagmiContractConfig.abi,
                          functionName: "stakeWithHBAR",
                          value: BigInt(parseEther(amount.toString())),
                        });
                        setTransactionHash(txHash);
                        toast.success("Transaction successful", {
                          id: toastId,
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

                        setBtnClicked(false);
                      } catch (error) {
                        toast.error("Transaction failed. Try again later.", {
                          id: toastId,
                        });

                        setBtnClicked(false);
                      }
                    }}
                  >
                    {BtnClicked ? (
                      <>
                        <Spinner /> Staking...
                      </>
                    ) : (
                      "Stake Now"
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="Unstake">
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle>Unstake &#8463;</CardTitle>
                <CardDescription>
                  You can unstake your tokens at any time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
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
                    disabled={amount - 10 < 0}
                  >
                    <FaMinus />
                  </Button>
                  <Button
                    variant={"outline"}
                    onClick={() => setAmount(stakedAmount)}
                  >
                    Maximum
                  </Button>
                  <Button
                    variant={"outline"}
                    onClick={() => setAmount(amount + 10)}
                    disabled={amount + 10 > stakedAmount}
                  >
                    <FaPlus />
                  </Button>
                </CardAction>
                <div className="flex flex-row items-center justify-center gap-x-4">
                  <div className="flex flex-row items-center justify-center gap-x-2">
                    <Checkbox
                      id="terms"
                      checked={isAgreed}
                      onCheckedChange={(checked) =>
                        setIsAgreed(checked as boolean)
                      }
                    />
                    <HoverCard>
                      <HoverCardTrigger>
                        <Label htmlFor="terms" className="cursor-pointer">
                          Accept terms and conditions
                        </Label>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-sm text-sm">
                        Stake your tokens to participate in the vote. Vote
                        correctly to get rewarded. Incorrect votes will be
                        penalized.
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                  <Button
                    disabled={
                      !isAgreed ||
                      amount <= 0 ||
                      amount > stakedAmount ||
                      BtnClicked
                    }
                    onClick={async () => {
                      setBtnClicked(true);
                      const toastId = toast.loading(
                        "Transaction in progress..."
                      );
                      try {
                        const txHash = await writeContractAsync({
                          address: wagmiContractConfig.address,
                          abi: wagmiContractConfig.abi,
                          functionName: "unstake",
                          args: [BigInt(Number(amount) * 1e8)],
                        });
                        setTransactionHash(txHash);
                        toast.success("Transaction successful", {
                          id: toastId,
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
                        setBtnClicked(false);
                      } catch (error) {
                        toast.error("Transaction failed. Try again later.", {
                          id: toastId,
                        });
                        setBtnClicked(false);
                      }
                    }}
                  >
                    {BtnClicked ? (
                      <>
                        <Spinner /> Unstaking...
                      </>
                    ) : (
                      "Unstake Now"
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Item variant="outline" className="w-xs md:w-sm">
        <ItemContent>
          <ItemTitle>Your Stakes</ItemTitle>
          <ItemDescription className="flex flex-wrap text-sm break-words whitespace-normal">
            Max Voting Power: {Math.max(Math.floor(stakedAmount / 10), 0)} votes
          </ItemDescription>
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

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
import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import {
  useAccount,
  useBalance,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { formatEther, parseEther } from "viem";
import { wagmiContractConfig } from "@/utils/contracts";
import { useQueryClient } from "@tanstack/react-query";
import { getBalanceQueryKey } from "wagmi/query";

export const Staking = () => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const balanceOfHBAR = useBalance({
    address: address,
    unit: "ether",
    query: {
      enabled: !!address,
      refetchOnWindowFocus: true,
    },
  });
  const { data: userDeposit } = useReadContract({
    ...wagmiContractConfig,
    functionName: "checkUserDeposit",
    args: [address],
    query: {
      enabled: !!address,
      refetchOnWindowFocus: true,
      refetchInterval: 3000,
    },
  });
  const maxTokens = Math.floor(
    Number(
      formatEther(
        balanceOfHBAR.data?.value
          ? balanceOfHBAR.data.value - BigInt(1000000000000000000)
          : BigInt(0)
      )
    )
  );
  const stakedAmount = Math.floor(
    Number(userDeposit ? (userDeposit as bigint) : BigInt(0)) / 1e8
  );
  const [totalStakedAmount, setTotalStakedAmount] = useState(0);
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
                    {BtnClicked ? "Staking..." : "Stake Now"}
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
                    {BtnClicked ? "Unstaking..." : "Unstake Now"}
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

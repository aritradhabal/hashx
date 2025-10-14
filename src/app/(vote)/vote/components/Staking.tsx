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

export const Staking = () => {
  const maxTokens = 500;
  const [totalStakedAmount, setTotalStakedAmount] = useState(0); // from the server or total tokens staked
  const [amount, setAmount] = useState(0);
  const [isAgreed, setIsAgreed] = useState(false);

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
                  readOnly
                  type="number"
                  placeholder="Amount"
                  value={amount > 0 ? amount : ""}
                />
              </CardContent>
              <CardFooter className="flex flex-col items-center justify-center gap-y-5">
                <CardAction className="w-full flex flex-row items-center justify-center gap-x-2">
                  <Button
                    variant={"outline"}
                    onClick={() => setAmount(amount - 100)}
                    disabled={amount <= 0}
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
                    onClick={() => setAmount(amount + 100)}
                    disabled={amount >= maxTokens}
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
                    disabled={!isAgreed || amount <= 0}
                    onClick={() => {
                      // Staking Transaction Logic and Polling the transaction status
                      const promise = () =>
                        new Promise((resolve) =>
                          setTimeout(() => resolve({ name: "Sonner" }), 1000)
                        );

                      toast.promise(promise, {
                        loading: "Transaction in progress...",
                        action: {
                          label: "Transaction hash",
                          onClick: () =>
                            console.log("Redirect to transaction hash"),
                        },
                        success: (data: any) => {
                          // On Success, Update the UI to show the staked amount, and Update in the DB
                          setTotalStakedAmount(totalStakedAmount + amount);
                          return `Transaction successful`;
                        },
                        error: "Transaction failed, Try again later.",
                      });
                    }}
                  >
                    Stake Now
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
                  readOnly
                  type="number"
                  placeholder="Amount"
                  value={amount > 0 ? amount : ""}
                />
              </CardContent>
              <CardFooter className="flex flex-col items-center justify-center gap-y-5">
                <CardAction className="w-full flex flex-row items-center justify-center gap-x-2">
                  <Button
                    variant={"outline"}
                    onClick={() => setAmount(amount - 100)}
                    disabled={amount <= 0}
                  >
                    <FaMinus />
                  </Button>
                  <Button
                    variant={"outline"}
                    onClick={() => setAmount(totalStakedAmount)}
                  >
                    Maximum
                  </Button>
                  <Button
                    variant={"outline"}
                    onClick={() => setAmount(amount + 100)}
                    disabled={amount >= totalStakedAmount}
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
                      !isAgreed || amount <= 0 || amount > totalStakedAmount
                    }
                    onClick={() => {
                      // Unstaking Transaction Logic and Polling the transaction status
                      const promise = () =>
                        new Promise((resolve) =>
                          setTimeout(() => resolve({ name: "Sonner" }), 1000)
                        );

                      toast.promise(promise, {
                        loading: "Transaction in progress...",
                        action: {
                          label: "Transaction hash",
                          onClick: () =>
                            console.log("Redirect to transaction hash"),
                        },
                        success: (data: any) => {
                          // On Success, Update the UI to show the staked amount, and Update in the Database
                          setTotalStakedAmount(totalStakedAmount - amount);
                          return `Transaction successful`;
                        },
                        error: "Transaction failed, Try again later.",
                      });
                    }}
                  >
                    Unstake Now
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
            Max Voting Power : {totalStakedAmount / 100} votes
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm">
            <p className="">{totalStakedAmount} &#8463;</p>
          </Button>
        </ItemActions>
      </Item>
    </div>
  );
};

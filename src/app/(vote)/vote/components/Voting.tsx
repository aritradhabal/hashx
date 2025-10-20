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
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { RiPerplexityFill } from "react-icons/ri";
import { FaXTwitter } from "react-icons/fa6";
import { wagmiContractConfig } from "@/utils/contracts";
import { useAccount, useReadContract } from "wagmi";
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
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MdContentCopy } from "react-icons/md";

export const Voting = () => {
  const { address } = useAccount();
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
  const stakedAmount = Math.floor(
    Number(userDeposit ? (userDeposit as bigint) : BigInt(0)) / 1e8
  );
  const pendingVotes = 10;
  const resolvedVotes = 10;

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
              Pending ({pendingVotes})
            </Button>
            <Button variant="outline" size="sm">
              Resolved ({resolvedVotes})
            </Button>
          </ItemActions>
        </Item>

        <Tabs
          defaultValue="Ongoing"
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
              {votes.map((vote) => (
                <VoteCard
                  key={vote.title}
                  title={vote.title}
                  description={vote.description}
                  optionA={vote.optionA}
                  optionB={vote.optionB}
                  showBadges={true}
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="Resolved">
            <div className="voting-container h-[60svh] flex flex-col gap-y-2 overflow-y-scroll">
              {votes.slice(0, 2).map((vote) => (
                <VoteCard
                  key={vote.title}
                  title={vote.title}
                  description={vote.description}
                  optionA={vote.optionA}
                  optionB={vote.optionB}
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="Upcoming">
            <div className="voting-container h-[60svh] flex flex-col gap-y-2 overflow-y-scroll">
              {votes.slice(0, 2).map((vote) => (
                <VoteCard
                  key={vote.title}
                  title={vote.title}
                  description={vote.description}
                  optionA={vote.optionA}
                  optionB={vote.optionB}
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
  title,
  description,
  showBadges,
}: {
  optionA: string;
  optionB: string;
  title: string;
  description: string;
  showBadges?: boolean;
}) => {
  return (
    <Item variant="outline" className="w-xs md:w-3xl">
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        <ItemDescription className="flex flex-wrap break-words whitespace-normal">
          {description}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="outline" size="sm">
          {optionA}
        </Button>
        <Button variant="outline" size="sm">
          {optionB}
        </Button>
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
          <div className="flex flex-row gap-x-1 items-center justify-center flex-wrap">
            <DetailsDialog />
            <Badge
              variant={"noEffect"}
              className="bg-background text-card-foreground border-background"
            >
              Reward: 100 &#8463;
            </Badge>
          </div>
        </ItemFooter>
      )}
    </Item>
  );
};

export const DetailsDialog = () => {
  const [sk_Recovered, setSkRecovered] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  return (
    <Dialog>
      <DialogTrigger>
        <Badge className="cursor-pointer" variant={"noEffect"}>
          Details
        </Badge>
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Public Parameters</DialogTitle>
          <DialogDescription>Vote ID: 0</DialogDescription>
        </DialogHeader>
        <InputGroup>
          <InputGroupTextarea
            readOnly={true}
            disabled={true}
            value={
              "b13646606242097565b2e7afa1fae30b19d82cf78d9fd82b5a9fa61e639f2590ac3e3010e2798007568bf77413226ca004dbb12746d3295c1448750e0495be2867fec0f80cd35f3344092784503e5cb7b0c33976be7212bfc2a87bc7acede34dfc2685dd6f546f31f688fa3b8bef5d98fe8c0279d026e1a5fd0c404754bfc6f704a5d53bcb4713bc52522f8cbb8bb827497e5cf2825047696910bb9ddad14097059722d13d5cb85391feb0ab490ca0f0408ea0a8c86ecf96658753bee9afae152d6e83f5dbdf8cb8b044122f4f8dc89caf58e54b300fc6c98be77d46a7cf6186a54f04abb6aaaadd79a31d152bf65edf7e2355b21c6b9462425804b4ab4e8fab068e6a4f62a2cf4bfe6abcd57a70b70b28b987fd8c2567278d89408e45cef3eba469b8172a01ac0a229cbfaa0a4eb5ef601272332db547bbd47f068488ca339b6c587624561fd06e32950f2347e9a395233218e65e9067c4e48c122da61a964f47ed4056f67a64df139f2adcad12dac1dfdbad8e3b44243f867eb5df801c150a916bc7e7d646d69415ea67b62398e2875cc6f51ac4bd9d1a75ca2c757e52903324b5f12cb41e8fb27cf848a4da2969e7afd00b46092eb2de19a4c511d2914f5f06f3371ca1f1391880db80c53735e5a6bf90a70174cddf0df5c37867f669fd88529284ab1b71f8fd43eddc509f8acc66575cddc10d48b90f055424c19ba78581"
            }
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
              value={"2"}
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
              value={"10000"}
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
            value={
              "c67b1bb15511bb83fb9da594fb026efd2e703c59173594fcc54b640c42d1c375"
            }
            id="public-parameters-sk"
            className="resize-none break-all text-xs font-mono !cursor-text"
          />
          <InputGroupAddon align="block-start">
            <Label htmlFor="public-parameters-sk" className="text-foreground">
              Hashed SecretKey
            </Label>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput
            value={sk_Recovered}
            onChange={(e) => {
              setSkRecovered(e.target.value);
            }}
            id="public-parameters-soln"
            placeholder="Enter computed puzzle solution"
            className="resize-none break-all text-xs font-mono !cursor-text"
          />
          <InputGroupAddon align="block-start">
            <Label htmlFor="public-parameters-soln" className="text-foreground">
              Secret Key (SK)
            </Label>
          </InputGroupAddon>
        </InputGroup>
        <DialogFooter className="flex flex-row flex-wrap !items-center !justify-between">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <div className="flex justify-center items-center gap-2 flex-wrap">
            <Button type="button" disabled={!sk_Recovered}>
              Verify
            </Button>
            <Button type="submit" disabled={!isVerified}>
              Submit
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const votes = [
  {
    title: "Who will win the election?",
    description:
      "Source: https://www.google.com and https://nytimes.com after 10 days of voting for each option",
    optionA: "Option A",
    optionB: "Option B",
  },
  {
    title: "Who will win the game?",
    description:
      "Source: https://www.google.com and https://nytimes.com after 10 days of voting for each option",
    optionA: "Option A",
    optionB: "Option B",
  },
  {
    title: "Who will win the movie awards?",
    description:
      "Source: https://www.google.com and https://nytimes.com after 10 days of voting for each option",
    optionA: "Option A",
    optionB: "Option B",
  },
  {
    title: "Who will win the tech awards?",
    description:
      "Source: https://www.google.com and https://nytimes.com after 10 days of voting for each option",
    optionA: "Option A",
    optionB: "Option B",
  },
  {
    title: "Who will win the music awards?",
    description:
      "Source: https://www.google.com and https://nytimes.com after 10 days of voting for each option",
    optionA: "Option A",
    optionB: "Option B",
  },
  {
    title: "Who will win the sports awards?",
    description:
      "Source: https://www.google.com and https://nytimes.com after 10 days of voting for each option",
    optionA: "Option A",
    optionB: "Option B",
  },
];

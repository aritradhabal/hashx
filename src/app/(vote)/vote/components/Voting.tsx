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
            <Badge
              variant={"noEffect"}
              className="bg-emerald-700 text-emerald-50 border-emerald-700"
            >
              Reward: 100 &#8463;
            </Badge>
          </div>
        </ItemFooter>
      )}
    </Item>
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

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
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  getActiveVotes,
  getResolvedVotes,
  getUpcomingVotes,
} from "@/actions/db-actions";
import type { VoteCardData } from "@/actions/db-actions";
import { keccak256 } from "viem";
type TabValue = "Ongoing" | "Resolved" | "Upcoming";

export const Voting = () => {
  const [activeTab, setActiveTab] = React.useState<TabValue>("Ongoing");
  const [ongoing, setOngoing] = useState<VoteCardData[]>([]);
  const [resolved, setResolved] = useState<VoteCardData[]>([]);
  const [upcoming, setUpcoming] = useState<VoteCardData[]>([]);

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
          }
        }
      }
      if (activeTab === "Upcoming") {
        const { success, data } = await getUpcomingVotes();
        if (success && data) {
          if (data.length != upcoming.length) {
            setUpcoming(data);
          }
        }
      }
    };
    fetchContracts(activeTab);
  }, [activeTab]);
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
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="Resolved">
            <div className="voting-container h-[60svh] flex flex-col gap-y-2 overflow-y-scroll">
              {resolved.slice(0, 2).map((vote) => (
                <VoteCard
                  key={vote.marketId}
                  title={vote.title}
                  description={vote.description}
                  optionA={vote.optionATitle}
                  optionB={vote.optionBTitle}
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
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="Upcoming">
            <div className="voting-container h-[60svh] flex flex-col gap-y-2 overflow-y-scroll">
              {upcoming.slice(0, 2).map((vote) => (
                <VoteCard
                  key={vote.marketId}
                  title={vote.title}
                  description={vote.description}
                  optionA={vote.optionATitle}
                  optionB={vote.optionBTitle}
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
  N,
  t,
  a,
  skLocked,
  publicKey,
  rewards,
  marketId,
  server,
  hashedSK,
}: {
  optionA: string;
  optionB: string;
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
          <p className="tracking-wide">{optionA}</p>
        </Button>
        <Button variant="outline" size="sm">
          <p className="tracking-wide">{optionB}</p>
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
            <DetailsDialog
              marketId={marketId}
              N={N}
              t={t}
              a={a}
              skLocked={skLocked}
              publicKey={publicKey}
              server={server}
              hashedSK={hashedSK}
            />
            <Badge
              variant={"noEffect"}
              className="bg-background text-card-foreground border-background"
            >
              Reward: {Math.floor(Number(rewards) / 1e8)} &#8463;
            </Badge>
          </div>
        </ItemFooter>
      )}
    </Item>
  );
};

export const DetailsDialog = ({
  N,
  t,
  a,
  skLocked,
  publicKey,
  marketId,
  server,
  hashedSK,
}: {
  N: string;
  t: string;
  a: number;
  skLocked: string;
  publicKey: string;
  marketId: string;
  server: boolean;
  hashedSK: string;
}) => {
  const [sk_Recovered, setSkRecovered] = useState<`0x${string}`>();
  const [isVerified, setIsVerified] = useState(false);
  const verifyPuzzle = () => {
    if (!sk_Recovered) return;
    const userKeccakhash = keccak256(sk_Recovered);
    if (userKeccakhash === hashedSK) {
      setIsVerified(true);
    } else {
      setIsVerified(false);
    }
  };
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
          <>
            <InputGroup>
              <InputGroupInput
                value={sk_Recovered ?? ""}
                onChange={(e) => {
                  setSkRecovered(e.target.value as `0x${string}`);
                }}
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
                <Button type="button" disabled={!sk_Recovered}>
                  Verify
                </Button>
                <Button type="submit" disabled={!isVerified}>
                  Submit
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

// export const votes = [
//   {
//     title: "Who will win the election?",
//     description:
//       "Source: https://www.google.com and https://nytimes.com after 10 days of voting for each option",
//     optionA: "Option A",
//     optionB: "Option B",
//   },
//   {
//     title: "Who will win the game?",
//     description:
//       "Source: https://www.google.com and https://nytimes.com after 10 days of voting for each option",
//     optionA: "Option A",
//     optionB: "Option B",
//   },
//   {
//     title: "Who will win the movie awards?",
//     description:
//       "Source: https://www.google.com and https://nytimes.com after 10 days of voting for each option",
//     optionA: "Option A",
//     optionB: "Option B",
//   },
//   {
//     title: "Who will win the tech awards?",
//     description:
//       "Source: https://www.google.com and https://nytimes.com after 10 days of voting for each option",
//     optionA: "Option A",
//     optionB: "Option B",
//   },
//   {
//     title: "Who will win the music awards?",
//     description:
//       "Source: https://www.google.com and https://nytimes.com after 10 days of voting for each option",
//     optionA: "Option A",
//     optionB: "Option B",
//   },
//   {
//     title: "Who will win the sports awards?",
//     description:
//       "Source: https://www.google.com and https://nytimes.com after 10 days of voting for each option",
//     optionA: "Option A",
//     optionB: "Option B",
//   },
// ];

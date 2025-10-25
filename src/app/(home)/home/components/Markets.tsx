"use client";
import { Button } from "@/components/ui/button";
import type { VoteCardData } from "@/actions/types";
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
import { Spinner } from "@/components/ui/spinner";
type TabValue = "Ongoing" | "Resolved" | "Upcoming";
import { toast } from "sonner";
import { VoteCard } from "@/app/(vote)/vote/components/votingComponents/VoteCard";
import { fetchContracts } from "@/app/(vote)/vote/components/votingComponents/fetchContracts";

export const Markets = () => {
  const [activeTab, setActiveTab] = React.useState<TabValue>("Ongoing");
  const [ongoing, setOngoing] = useState<VoteCardData[]>([]);
  const [resolved, setResolved] = useState<VoteCardData[]>([]);
  const [upcoming, setUpcoming] = useState<VoteCardData[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isUserVoted, setIsUserVoted] = useState(false);

  useEffect(() => {
    const fetchContractsClient = async (activeTab: TabValue) => {
      setIsFetching(true);
      const { success, data } = await fetchContracts(activeTab);
      if (success) {
        if (activeTab === "Ongoing") {
          setOngoing(data as VoteCardData[]);
        }
        if (activeTab === "Resolved") {
          setResolved(data as VoteCardData[]);
        }
        if (activeTab === "Upcoming") {
          setUpcoming(data as VoteCardData[]);
        }
        setIsFetching(false);
      } else {
        setIsFetching(false);
        toast.error("Failed to fetch data. Try again...", { duration: 3500 });
      }
    };

    fetchContractsClient(activeTab);
  }, [activeTab]);

  return (
    <>
      <div className="h-full w-full flex flex-col justify-start items-center gap-y-5">
        <h2 className="w-xs md:w-xl xl:w-2xl text-xl md:text-2xl xl:text-3xl text-center font-bold break-words whitespace-normal pt-2 md:pt-5 xl:pt-7">
          Bet on your beliefs and earn rewards
        </h2>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabValue)}
          className="w-xs md:w-3xl xl:w-4xl 2xl:w-5xl pb-5 flex flex-col items-center justify-center gap-y-5 "
        >
          <TabsList className="w-full">
            <TabsTrigger value="Ongoing" className="cursor-pointer">
              Ongoing
            </TabsTrigger>
            <TabsTrigger value="Resolved" className="cursor-pointer">
              Resolved
            </TabsTrigger>
          </TabsList>
          <TabsContent value="Ongoing">
            <div className="voting-container h-[60svh] flex flex-col gap-y-2 overflow-y-scroll">
              {isFetching && (
                <div className="w-full flex items-center justify-center pb-1 gap-x-2 text-sm text-muted-foreground">
                  <Spinner /> Loading...
                </div>
              )}
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
              {isFetching && (
                <div className="w-full flex items-center justify-center pb-1 gap-x-2 text-sm text-muted-foreground">
                  <Spinner /> Loading...
                </div>
              )}
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
        </Tabs>
      </div>
    </>
  );
};

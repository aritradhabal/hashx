"use client";
import type { MarketCardData } from "@/actions/types";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemTitle,
} from "@/components/ui/item";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
type TabValue = "Ongoing" | "Resolved";
import { toast } from "sonner";
import { fetchMarketsByResolution } from "@/actions/db-actions";
import { MarketCard } from "./MarketCard";

export const Markets = () => {
  const [activeTab, setActiveTab] = React.useState<TabValue>("Ongoing");
  const [ongoing, setOngoing] = useState<MarketCardData[]>([]);
  const [resolved, setResolved] = useState<MarketCardData[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const fetchMarketsClient = async (activeTab: TabValue) => {
      setIsFetching(true);
      const isResolved = activeTab === "Resolved";
      const { success, data } = await fetchMarketsByResolution(isResolved);
      if (success) {
        if (isResolved) setResolved((data as MarketCardData[]) ?? []);
        else setOngoing((data as MarketCardData[]) ?? []);
        setIsFetching(false);
      } else {
        setIsFetching(false);
        toast.error("Failed to fetch markets. Try again...", {
          duration: 3500,
        });
      }
    };

    fetchMarketsClient(activeTab);
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
              {!isFetching && ongoing.length === 0 && (
                <div className="w-full flex items-center justify-center pb-1 text-sm text-muted-foreground">
                  No events here.
                </div>
              )}
              {ongoing.map((m) => (
                <MarketCard
                  key={m.marketId}
                  title={m.title}
                  description={m.description}
                  marketAddress={m.marketAddress}
                  oracleAddress={m.oracleAddress}
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
              {!isFetching && resolved.length === 0 && (
                <div className="w-full flex items-center justify-center pb-1 text-sm text-muted-foreground">
                  No events here.
                </div>
              )}
              {resolved.map((m) => (
                <MarketCard
                  key={m.marketId}
                  title={m.title}
                  description={m.description}
                  marketAddress={m.marketAddress}
                  oracleAddress={m.oracleAddress}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

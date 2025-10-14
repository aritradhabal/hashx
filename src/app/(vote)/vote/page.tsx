import { Separator } from "@/components/ui/separator";
import React from "react";
import { Voting } from "./components/Voting";

const Vote = async () => {
  return (
    <div className="h-full w-full grid grid-cols-1 md:grid-cols-[minmax(0,500px)_auto_minmax(0,1fr)] gap-y-10">
      {/* <Staking /> */}
      <div>Staking Section</div>
      <Separator orientation="horizontal" className="block md:hidden" />
      <Separator
        orientation="vertical"
        className="hidden md:block data-[orientation=vertical]:h-auto w-px bg-foreground/20"
      />
      <Voting />
    </div>
  );
};

export default Vote;

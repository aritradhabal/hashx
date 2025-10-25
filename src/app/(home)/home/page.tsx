import React from "react";
import { Separator } from "@/components/ui/separator";
import { Markets } from "./components/Markets";
import { CreateMarket } from "./components/CreateMarket";

const Home = () => {
  return (
    <div className="h-full w-full grid grid-cols-1 md:grid-cols-[minmax(0,500px)_auto_minmax(0,1fr)] gap-y-10">
      <CreateMarket />
      <Separator orientation="horizontal" className="block md:hidden" />
      <Separator
        orientation="vertical"
        className="hidden md:block data-[orientation=vertical]:h-auto w-px bg-foreground/20"
      />
      <Markets />
    </div>
  );
};

export default Home;

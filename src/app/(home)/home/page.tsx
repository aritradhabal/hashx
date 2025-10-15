import React from "react";
import { CreateVote } from "./components/CreateVote";

const Home = () => {
  return (
    <div className="h-full w-full flex flex-col gap-y-4 items-center justify-center">
      HomePage
      <CreateVote />
    </div>
  );
};

export default Home;

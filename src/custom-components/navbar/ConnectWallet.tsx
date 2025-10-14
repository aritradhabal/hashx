import React from "react";
import { Button } from "@/components/ui/button";
import { IoLogIn } from "react-icons/io5";

const ConnectWallet = () => {
  return (
    <Button size={"sm"}>
      Sign In <IoLogIn />
    </Button>
  );
};

export default ConnectWallet;

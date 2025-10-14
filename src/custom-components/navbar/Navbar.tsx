import React from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MdLeaderboard } from "react-icons/md";
import { FaVoteYea } from "react-icons/fa";
import { TbMathFunction } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ConnectWallet from "./ConnectWallet";

const Navbar = () => {
  return (
    <div className="hidden fixed top-0 w-screen md:flex flex-row justify-between items-center p-4">
      <div className="flex flex-row items-center gap-x-2">
        <Link href="/" className="cursor-pointer">
          <Image
            src="/HashX.png"
            alt="logo"
            width={100}
            height={100}
            priority
          />
        </Link>
        <SearchBar />
      </div>
      <div className="flex flex-row items-center gap-x-2">
        <Link href="/leaderboard" className="cursor-pointer">
          <Button variant="ghost">
            <MdLeaderboard /> Leaderboard
          </Button>
        </Link>
        <Link href="/strategies" className="cursor-pointer">
          <Button variant="ghost">
            <TbMathFunction />
            Strategies
          </Button>
        </Link>
        <Link href="/vote" className="cursor-pointer">
          <Button
            variant="ghost"
            className="flex flex-row items-center justify-center gap-x-2 "
          >
            <FaVoteYea /> Place Vote{" "}
          </Button>
        </Link>

        <Separator
          orientation="vertical"
          className="data-[orientation=vertical]:h-6 w-px bg-foreground/20"
        />
        <ConnectWallet />
      </div>
    </div>
  );
};

export default Navbar;

export const SearchBar = () => {
  return (
    <InputGroup className="w-2xl">
      <InputGroupInput placeholder="Search..." />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <InputGroupButton className="rounded-md">Search</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
};

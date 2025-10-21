"use client";
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
import { Label } from "@/components/ui/label";
import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import {
  wagmiContractConfig,
  CreateVoteFactoryContractConfig,
} from "@/utils/contracts";
import { useQueryClient } from "@tanstack/react-query";
import { getBalanceQueryKey } from "wagmi/query";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { HBAR_LOCKING_CONTRACT_ADDRESS } from "@/constants";
import { useTransactionReceipt } from "wagmi";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { calculateTforTimestamp } from "@/app/actions/getTime";
interface argsT {
  marketId: bigint | undefined;
  optionA: bigint | undefined;
  optionB: bigint | undefined;
  rewards: bigint | undefined;
  startTimestamp: bigint | undefined;
  endTimestamp: bigint | undefined;
  thresholdVotes: number | undefined;
  hbarLockingContractAddress: `0x${string}` | undefined;
  N: `0x${string}` | undefined;
  t: bigint | undefined;
  a: number | undefined;
  skLocked: `0x${string}` | undefined;
  hashedSK: `0x${string}` | undefined;
}
export const CreateVote = () => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [amount, setAmount] = useState(0);
  const [BtnClicked, setBtnClicked] = useState(false);
  const [timeError, setTimeError] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);

  const { data: receipt, isSuccess: isConfirmed } = useTransactionReceipt({
    hash: txHash as `0x${string}`,
    query: {
      enabled: !!txHash,
    },
  });
  useEffect(() => {
    if (!txHash) return;
    console.log("txhash", txHash);
  }, [txHash, isConfirmed]);

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
  const maxTokens = Math.floor(
    Number(userDeposit ? (userDeposit as bigint) : BigInt(0)) / 1e8
  );

  const [args, setArgs] = useState<argsT>({
    marketId: BigInt(13),
    optionA: BigInt(0),
    optionB: BigInt(1),
    rewards: undefined,
    startTimestamp: undefined,
    endTimestamp: undefined,
    thresholdVotes: 1,
    hbarLockingContractAddress: HBAR_LOCKING_CONTRACT_ADDRESS,
    N: "0xc7e4f83e0265987d8b5057f6828678b0987af3e2faec8a69e4417afe960805812a85fcee82e4d5b9fe6afb2f6347d5e8450af9f895229c61758fbeb2b910c9d26c8b1bbebff7fe75236c9947816533114ffd4edd3a607d42cb6cb0605da6c1bed550a3f35d58697c0b3129c32ff9ead2edb093f2a057e7fb15e82c464ad7363fc166da37bda642c6a22787cab5186457035da84d7a767b23280a2a74693f45cf0e53abff735ad6769ced77066108ab81131ee2ecd15e031d1fd2f401b21a71fac6cbb51f4e315b9ee79450b793b3adb9e2e33a86043319690da67085d0c313d3c487844370a8146933df15cbec133f7c5017771c1f0bfbfb95f9657b5cfbf322a780eeb67f92f3f3fc9e92f3a6b3f6b737d006872b261c54a7f9f5f3626d370fad30c21eb4356c970294cb640aaa3028d6e53b89d0e0e50dc2a5cbc9c9da26e5a5ba4754ee00a3e2a1f204c52d14e5643b4e5005e905b80f9020f34cb94271d4f7221e1a7ac07188fff5d951d6de19f827690bfdb95920a98047c5739a66d6ede7839cf3307073e26649f5e59844e9da6f6f703798951d6ec5e14b1080340e27616eb9e52c113b3fe7e98db73afbf8da776b7b2360cfd014cd7a8d30a37671a871cba653fc493a224e3ace701f261e7e594b5dfb74ad5adecf60b7452da03607897aefeabd666a48b1efe13a98d38fa42640d5eee435a1837a2be4627660c0c7",
    t: undefined,
    a: 2,
    skLocked:
      "0x504b185df28721f6905923008cc8e3985ea4dcaa53a848ff29eba4960aeecc7c",
    hashedSK:
      "0xb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6",
  });

  useMemo(() => {
    if (!args.endTimestamp) return;
    const t = calculateTforTimestamp(args.endTimestamp as bigint);
    console.log(t.toString());
    setArgs((prev: argsT) => ({
      ...prev,
      t: t,
    }));
  }, [args.endTimestamp]);

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant={"secondary"}>Create Vote</Button>
        </DialogTrigger>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Create Vote</DialogTitle>
            <DialogDescription>
              Creating a voting contract for the event.
            </DialogDescription>
          </DialogHeader>

          <Card className="w-full bg-background rounded-md">
            <CardHeader>
              <CardTitle>Voting Reward in &#8463;</CardTitle>
              <CardDescription className="text-xs">
                Voting Rewards will be distributed in proportion voters balance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                placeholder="Amount"
                value={amount > 0 ? amount : ""}
                onChange={(e) => {
                  setAmount(Number(e.target.value));
                  setArgs((prev: argsT) => ({
                    ...prev,
                    rewards: BigInt(Number(e.target.value) * 1e8),
                  }));
                }}
              />
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-center gap-y-5">
              <CardAction className="w-full flex flex-row items-center justify-center gap-x-2">
                <Button
                  variant={"outline"}
                  onClick={() => {
                    setAmount(amount - 10);
                    setArgs((prev: argsT) => ({
                      ...prev,
                      rewards: BigInt(Number(amount - 10) * 1e8),
                    }));
                  }}
                  disabled={amount - 10 < 0}
                >
                  <FaMinus />
                </Button>
                <Button
                  variant={"outline"}
                  onClick={() => {
                    setAmount(maxTokens);
                    setArgs((prev: argsT) => ({
                      ...prev,
                      rewards: BigInt(maxTokens * 1e8),
                    }));
                  }}
                >
                  Maximum
                </Button>
                <Button
                  variant={"outline"}
                  onClick={() => {
                    setAmount(amount + 10);
                    setArgs((prev: argsT) => ({
                      ...prev,
                      rewards: BigInt(Number(amount + 10) * 1e8),
                    }));
                  }}
                  disabled={amount + 10 > maxTokens}
                >
                  <FaPlus />
                </Button>
              </CardAction>
              <DateTimePicker
                timeError={timeError}
                setTimeError={setTimeError}
                args={args}
                setArgs={setArgs}
              />
              <SelectResolutionCard />
            </CardFooter>
          </Card>

          <DialogFooter className="flex flex-row items-center !justify-between gap-x-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              disabled={
                amount <= 0 || amount > maxTokens || BtnClicked || timeError
              }
              onClick={async () => {
                setBtnClicked(true);
                const toastId = toast.loading("Transaction in progress...");
                try {
                  const txHash = await writeContractAsync({
                    address: CreateVoteFactoryContractConfig.address,
                    abi: CreateVoteFactoryContractConfig.abi,
                    functionName: "createVoteContracts",
                    args: [
                      args.marketId,
                      args.optionA,
                      args.optionB,
                      args.rewards,
                      args.startTimestamp,
                      args.endTimestamp,
                      args.thresholdVotes,
                      args.hbarLockingContractAddress,
                      args.N,
                      args.t,
                      args.a,
                      args.skLocked,
                      args.hashedSK,
                    ],
                  });
                  setTxHash(txHash);
                  toast.success("Transaction successful", {
                    id: toastId,
                    action: {
                      label: "View on Explorer",
                      onClick: () => {
                        window.open(
                          `https://hashscan.io/testnet/transaction/${txHash}`,
                          "_blank"
                        );
                      },
                    },
                  });

                  setBtnClicked(false);
                } catch (error) {
                  toast.error("Transaction failed. Try again later.", {
                    id: toastId,
                  });

                  setBtnClicked(false);
                }
              }}
            >
              {BtnClicked ? (
                <>
                  <Spinner /> Loading...
                </>
              ) : (
                "Create Vote"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const DateTimePicker = ({
  timeError,
  setTimeError,
  args,
  setArgs,
}: {
  timeError: boolean;
  setTimeError: (timeError: boolean) => void;
  args: argsT;
  setArgs: Dispatch<SetStateAction<argsT>>;
}) => {
  function getFormattedTime(date: Date): string {
    return date.toLocaleTimeString("en-GB", { hour12: false });
  }
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  const twoHoursLater = new Date(now.getTime() + 60 * 60 * 2 * 1000);

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date(Date.now()));
  const [startTime, setStartTime] = useState<string>(
    getFormattedTime(oneHourLater)
  );
  const [endTime, setEndTime] = useState<string>(
    getFormattedTime(twoHoursLater)
  );

  const startTimeInUnix = Math.floor(
    new Date(`${date.toDateString()} ${startTime}`).getTime() / 1000
  );

  const endTimeInUnix = Math.floor(
    new Date(`${date.toDateString()} ${endTime}`).getTime() / 1000
  );

  useEffect(() => {
    setArgs((prev) => ({
      ...prev,
      startTimestamp: BigInt(startTimeInUnix),
      endTimestamp: BigInt(endTimeInUnix),
    }));
  }, [startTimeInUnix, endTimeInUnix]);

  const currentTimeUnix = Math.floor(Date.now() / 1000);

  useEffect(() => {
    if (startTimeInUnix < currentTimeUnix) {
      setTimeError(true);
    } else {
      setTimeError(false);
    }
  }, [startTimeInUnix, currentTimeUnix]);

  return (
    <>
      <div className="w-full flex flex-row items-center justify-around gap-2 md:gap-4 flex-wrap">
        <div className="flex flex-col gap-3">
          <Label htmlFor="date-picker" className="px-1">
            Voting Date
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date-picker"
                className="w-32 justify-between font-normal"
              >
                {date ? date.toLocaleDateString() : "Select date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={date}
                captionLayout="label"
                fixedWeeks={true}
                required
                disabled={{
                  before: new Date(Date.now()),
                  after: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
                }}
                onSelect={(date) => {
                  setDate(date);
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-col gap-3">
          <Label htmlFor="start-time-picker" className="px-1">
            Start Time
          </Label>
          <Input
            type="time"
            id="start-time-picker"
            step="1"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </div>
        <div className="flex flex-col gap-3">
          <Label htmlFor="end-time-picker" className="px-1">
            End Time
          </Label>
          <Input
            type="time"
            id="end-time-picker"
            step="1"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </div>
      </div>
    </>
  );
};

export const SelectResolutionCard = () => {
  return (
    <div className="w-full">
      <FieldGroup>
        <FieldSet>
          <FieldLabel className="hidden"></FieldLabel>
          <FieldDescription className="hidden"></FieldDescription>
          <RadioGroup defaultValue="autoresolve">
            <FieldLabel htmlFor="autoresolve" className="cursor-pointer">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Resolve Automatically</FieldTitle>
                  <FieldDescription>
                    Secret Key will be stored in the server.
                  </FieldDescription>
                </FieldContent>
                <RadioGroupItem value="autoresolve" id="autoresolve" />
              </Field>
            </FieldLabel>
            <FieldLabel htmlFor="solve-manually" className="cursor-pointer">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Resolve Manually</FieldTitle>
                  <FieldDescription>No secret will be stored.</FieldDescription>
                </FieldContent>
                <RadioGroupItem value="solve-manually" id="solve-manually" />
              </Field>
            </FieldLabel>
          </RadioGroup>
        </FieldSet>
      </FieldGroup>
    </div>
  );
};

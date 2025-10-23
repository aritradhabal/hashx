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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { HBAR_LOCKING_CONTRACT_ADDRESS } from "@/constants";
import { useTransactionReceipt, useWaitForTransactionReceipt } from "wagmi";
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
import { calculateTforTimestamp } from "@/actions/getTime";
import { generateKeyPair } from "@/actions/keygen";
import { verifySecret } from "@/actions/db-actions";
export interface argsT {
  marketId: bigint | undefined;
  optionA: bigint | undefined;
  optionB: bigint | undefined;
  rewards: bigint | undefined;
  startTimestamp: bigint | undefined;
  endTimestamp: bigint | undefined;
  thresholdVotes: number | undefined; // unused
  hbarLockingContractAddress: `0x${string}` | undefined;
  N: `0x${string}` | undefined;
  t: bigint | undefined;
  a: number | undefined;
  skLocked: `0x${string}` | undefined;
  hashedSK: `0x${string}` | undefined;
  publicKey: `0x${string}` | undefined;
}
export const CreateVote = () => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [amount, setAmount] = useState(0);
  const [BtnClicked, setBtnClicked] = useState(false);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [timeError, setTimeError] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [servergen, setServergen] = useState<boolean>(true);
  const [dialogOpen, setDialogppen] = useState<boolean>(false);
  const [args, setArgs] = useState<argsT>({
    marketId: undefined,
    optionA: BigInt(1),
    optionB: BigInt(2),
    rewards: undefined,
    startTimestamp: undefined,
    endTimestamp: undefined,
    thresholdVotes: 1,
    hbarLockingContractAddress: HBAR_LOCKING_CONTRACT_ADDRESS,
    N: undefined,
    t: undefined,
    a: 2,
    skLocked: undefined,
    hashedSK: undefined,
    publicKey: undefined,
  });
  const { isSuccess: isConfirmed, isError } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
    query: {
      enabled: !!txHash,
    },
  });

  useEffect(() => {
    if (!isConfirmed) return;
    setVerifying(true);

    const verifyTxHash = async () => {
      const { success, contractAddress } = await verifySecret(
        txHash as `0x${string}`
      );
      setDialogppen(false);
      if (!success) {
        toast.error("Couldn't Verify Contract! Try again...", {
          duration: 3500,
        });
        setDialogppen(false);
        setVerifying(false);
        setBtnClicked(false);
      } else {
        toast.success("Contract Created", {
          duration: 3500,
          action: {
            label: "View on Explorer",
            onClick: () => {
              window.open(
                `https://hashscan.io/testnet/contract/${contractAddress}`,
                "_blank"
              );
            },
          },
        });
        setVerifying(false);
        setBtnClicked(false);
      }
    };
    verifyTxHash();
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

  useEffect(() => {
    if (!args.endTimestamp) return;
    const t = calculateTforTimestamp(args.endTimestamp as bigint);
    setArgs((prev: argsT) => ({
      ...prev,
      t: t,
    }));
  }, [args.endTimestamp]);

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogppen}>
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
                disabled={verifying}
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
                  disabled={amount - 10 < 0 || verifying}
                >
                  <FaMinus />
                </Button>
                <Button
                  variant={"outline"}
                  disabled={verifying}
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
                  disabled={amount + 10 > maxTokens || verifying}
                >
                  <FaPlus />
                </Button>
              </CardAction>
              <DateTimePicker
                verifying={verifying}
                setArgs={setArgs}
                setTimeError={setTimeError}
              />
              <SelectResolutionCard
                verifying={verifying}
                servergen={servergen}
                setServergen={setServergen}
              />
            </CardFooter>
          </Card>

          <DialogFooter className="flex flex-row items-center !justify-between gap-x-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            {!verifying ? (
              <Button
                disabled={
                  amount <= 0 || amount > maxTokens || BtnClicked || timeError
                }
                onClick={async () => {
                  setBtnClicked(true);
                  const marketId = BigInt(
                    (Date.now() << 20) ^ Math.floor(Math.random() * (1 << 20))
                  );
                  const {
                    success: storedInServer,
                    publicKey,
                    hashedSK,
                    n,
                    a,
                    t,
                    skLocked,
                  } = await generateKeyPair(
                    servergen,
                    args.t as bigint,
                    marketId
                  );

                  if (!storedInServer) {
                    setBtnClicked(false);
                    return;
                  }

                  setArgs((prev: argsT) => ({
                    ...prev,
                    marketId: marketId,
                    N: n,
                    a: a,
                    t: t,
                    skLocked: skLocked,
                    hashedSK: hashedSK,
                    publicKey: publicKey,
                  }));
                  const callArgs = {
                    ...args,
                    marketId,
                    N: n,
                    a,
                    t,
                    skLocked,
                    hashedSK,
                    publicKey,
                  };

                  const toastId = toast.loading("Transaction in progress...");
                  try {
                    const txHash = await writeContractAsync({
                      address: CreateVoteFactoryContractConfig.address,
                      abi: CreateVoteFactoryContractConfig.abi,
                      functionName: "createVoteContracts",
                      args: [
                        callArgs.marketId,
                        callArgs.optionA,
                        callArgs.optionB,
                        callArgs.rewards,
                        callArgs.startTimestamp,
                        callArgs.endTimestamp,
                        callArgs.thresholdVotes,
                        callArgs.hbarLockingContractAddress,
                        callArgs.N,
                        callArgs.t,
                        callArgs.a,
                        callArgs.skLocked,
                        callArgs.hashedSK,
                        callArgs.publicKey,
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
                    if (isConfirmed || isError) {
                      setBtnClicked(false);
                    }
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
            ) : (
              <Button disabled>
                {verifying ? (
                  <>
                    <Spinner /> Verifying...
                  </>
                ) : (
                  <>
                    <Spinner /> Redirecting...
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const DateTimePicker = ({
  setArgs,
  setTimeError,
  verifying,
}: {
  verifying: boolean;
  setArgs: Dispatch<SetStateAction<argsT>>;
  setTimeError: (timeError: boolean) => void;
}) => {
  function getFormattedTime(date: Date): string {
    return date.toLocaleTimeString("en-GB", { hour12: false });
  }
  const now = new Date();
  const nowSec = Math.floor(Date.now() / 1000);

  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  const twoMinutesLater = new Date(now.getTime() + 2 * 60 * 1000);
  const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);
  const twoHoursLater = new Date(now.getTime() + 60 * 60 * 2 * 1000);

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date(Date.now()));
  const [startTime, setStartTime] = useState<string>(
    getFormattedTime(twoMinutesLater)
  );
  const [endTime, setEndTime] = useState<string>(
    getFormattedTime(tenMinutesLater)
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
                disabled={[
                  {
                    before: new Date(Date.now()),
                    after: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
                  },
                  verifying && (() => true),
                ].filter(Boolean)}
                hideNavigation={verifying}
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
            disabled={verifying}
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
            disabled={verifying}
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

export const SelectResolutionCard = ({
  verifying,
  servergen,
  setServergen,
}: {
  verifying: boolean;
  servergen: boolean;
  setServergen: (servergen: boolean) => void;
}) => {
  return (
    // <div className="w-full">
    //   <FieldGroup>
    //     <FieldSet>
    //       <FieldLabel className="hidden"></FieldLabel>
    //       <FieldDescription className="hidden"></FieldDescription>
    //       <RadioGroup defaultValue="autoresolve">
    //         <FieldLabel htmlFor="autoresolve" className="cursor-pointer">
    //           <Field orientation="horizontal">
    //             <FieldContent>
    //               <FieldTitle>Resolve Automatically</FieldTitle>
    //               <FieldDescription>
    //                 Secret Key will be stored in the server.
    //               </FieldDescription>
    //             </FieldContent>
    //             <RadioGroupItem
    //               disabled={verifying}
    //               value="autoresolve"
    //               id="autoresolve"
    //             />
    //           </Field>
    //         </FieldLabel>
    //         <FieldLabel htmlFor="solve-manually" className="cursor-pointer">
    //           <Field orientation="horizontal">
    //             <FieldContent>
    //               <FieldTitle>Resolve Manually</FieldTitle>
    //               <FieldDescription>No secret will be stored.</FieldDescription>
    //             </FieldContent>
    //             <RadioGroupItem
    //               disabled={verifying}
    //               value="solve-manually"
    //               id="solve-manually"
    //             />
    //           </Field>
    //         </FieldLabel>
    //       </RadioGroup>
    //     </FieldSet>
    //   </FieldGroup>
    // </div>
    <div className="w-full">
      <FieldGroup>
        <FieldSet>
          <FieldLabel className="hidden"></FieldLabel>
          <FieldDescription className="hidden"></FieldDescription>
          <RadioGroup
            value={servergen ? "autoresolve" : "solve-manually"}
            onValueChange={(val) => setServergen(val === "autoresolve")}
          >
            <FieldLabel
              htmlFor="autoresolve"
              className="cursor-pointer"
              onClick={() => !verifying && setServergen(true)}
            >
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Resolve Automatically</FieldTitle>
                  <FieldDescription>
                    Secret Key will be stored in the server.
                  </FieldDescription>
                </FieldContent>
                <RadioGroupItem
                  disabled={verifying}
                  value="autoresolve"
                  id="autoresolve"
                />
              </Field>
            </FieldLabel>
            <FieldLabel
              htmlFor="solve-manually"
              className="cursor-pointer"
              onClick={() => !verifying && setServergen(false)}
            >
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Resolve Manually</FieldTitle>
                  <FieldDescription>No secret will be stored.</FieldDescription>
                </FieldContent>
                <RadioGroupItem
                  disabled={verifying}
                  value="solve-manually"
                  id="solve-manually"
                />
              </Field>
            </FieldLabel>
          </RadioGroup>
        </FieldSet>
      </FieldGroup>
    </div>
  );
};

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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import {
  useAccount,
  useBalance,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { formatEther, parseEther } from "viem";
import { wagmiContractConfig } from "@/utils/contracts";
import { useQueryClient } from "@tanstack/react-query";
import { getBalanceQueryKey } from "wagmi/query";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";

export const CreateVote = () => {
  const [amount, setAmount] = useState(0);
  const [BtnClicked, setBtnClicked] = useState(false);
  const [timeError, setTimeError] = useState<boolean>(false);
  const [marketName, setMarketName] = useState<string>(
    "Pariatur duis deserunt anim elit cupidatat laborum"
  );
  const [marketDescription, setMarketDescription] = useState<string>(
    "Reprehenderit eu mollit cupidatat esse nulla anim aliquip culpa. Fugiat elit non ut non qui quis nulla id non officia ullamco ea sit dolor dolore."
  );
  const [marketLink, setMarketLink] = useState<string>("");
  const [marketOptions, setMarketOptions] = useState<string[]>([]);
  const [value, setValue] = useState<number[]>([0, 1000]);
  const maxTokens = 5000;
  const { writeContractAsync } = useWriteContract();

  return (
    <>
      <Dialog>
        <DialogTrigger>
          <div>Create Vote</div>
        </DialogTrigger>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Create Vote</DialogTitle>
            <DialogDescription>
              Create a voting contract for the following market.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <FieldSet>
              <FieldLabel htmlFor="market-details">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>{marketName}</FieldTitle>
                    <FieldDescription>{marketDescription}</FieldDescription>
                  </FieldContent>
                </Field>
              </FieldLabel>
            </FieldSet>
          </FieldGroup>

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
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-center gap-y-5">
              <CardAction className="w-full flex flex-row items-center justify-center gap-x-2">
                <Button
                  variant={"outline"}
                  onClick={() => setAmount(amount - 10)}
                  disabled={amount - 10 < 0}
                >
                  <FaMinus />
                </Button>
                <Button
                  variant={"outline"}
                  onClick={() => setAmount(maxTokens)}
                >
                  Maximum
                </Button>
                <Button
                  variant={"outline"}
                  onClick={() => setAmount(amount + 10)}
                  disabled={amount + 10 > maxTokens}
                >
                  <FaPlus />
                </Button>
              </CardAction>
              <DateTimePicker
                timeError={timeError}
                setTimeError={setTimeError}
              />
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
                    address: wagmiContractConfig.address,
                    abi: wagmiContractConfig.abi,
                    functionName: "stakeWithHBAR",
                    value: BigInt(parseEther(amount.toString())),
                  });

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
                  <Spinner /> Staking...
                </>
              ) : (
                "Stake Now"
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
}: {
  timeError: boolean;
  setTimeError: (timeError: boolean) => void;
}) => {
  function getFormattedTime(date: Date): string {
    return date.toLocaleTimeString("en-GB", { hour12: false });
  }
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date(Date.now()));
  const [startTime, setStartTime] = useState<string>(getFormattedTime(now));
  const [endTime, setEndTime] = useState<string>(
    getFormattedTime(oneHourLater)
  );

  const startTimeInUnix = Math.floor(
    new Date(`${date.toDateString()} ${startTime}`).getTime() / 1000
  );

  const endTimeInUnix = Math.floor(
    new Date(`${date.toDateString()} ${endTime}`).getTime() / 1000
  );

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
      <div className="w-full flex flex-row items-center justify-around gap-4 flex-wrap">
        <div className="flex flex-col gap-3">
          <Label htmlFor="date-picker" className="px-1">
            Date
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

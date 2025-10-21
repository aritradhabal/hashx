// const TIME_PER_OP = 3e-7;
const TIME_PER_OP = 0.0003;

export const calculateTforTimestamp = (targetTimestamp: bigint): bigint => {
  const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
  const durationInSeconds = targetTimestamp - currentTimestamp;

  if (durationInSeconds <= 0n) {
    return 0n;
  }

  const durationNum = Number(durationInSeconds);
  if (!Number.isFinite(durationNum)) {
    throw new Error("Timestamp difference is too large to convert to number");
  }

  const t = Math.round(durationNum / TIME_PER_OP);

  return BigInt(t);
};

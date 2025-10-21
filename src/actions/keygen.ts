"use server";
import {
  packPoint,
  unpackPoint,
  mulPointEscalar,
  Point,
} from "@zk-kit/baby-jubjub";
import crypto from "crypto";
import { keccak256, toHex } from "viem";
import { createTimeLockPuzzle } from "./timelock";
import type { argsT } from "@/app/(home)/home/components/CreateVote";
import { addSecrets } from "./db-actions";
import type { secretParamsT } from "./db-actions";

export const generateKeyPair = async (server: boolean, args: argsT) => {
  const Base8: Point<bigint> = [
    16540640123574156134436876038791482806971768689494387082833631921987005038935n,
    20819045374670962167435360035096875258406992893633759881276124905556507972311n,
  ];
  const time = args.t as bigint;
  const privateKey = BigInt(`0x${crypto.randomBytes(32).toString("hex")}`);
  const _publicKey = packPoint(mulPointEscalar(Base8, privateKey));

  const { n, a, t, skLocked } = await createTimeLockPuzzle(privateKey, time);

  const publicKey = toHex(_publicKey);
  let hexPrivateKey = toHex(privateKey);
  const hashedSK = keccak256(hexPrivateKey);
  if (!server) {
    hexPrivateKey = "0x0000000000000000000000000000000000000000";
  }
  const secretsData: secretParamsT = {
    marketId: args.marketId as bigint,
    N: n,
    a: a,
    t: t,
    skLocked: skLocked,
    publicKey: publicKey,
    secretKey: hexPrivateKey,
    hashedSK: hashedSK,
    verified: false,
    server: server,
  };
  const { success } = await addSecrets(secretsData);

  return {
    success,
    publicKey,
    hashedSK,
    n,
    a,
    t,
    skLocked,
  };
};

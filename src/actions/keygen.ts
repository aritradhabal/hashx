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

export const generateKeyPair = async (server: boolean, time: bigint) => {
  const Base8: Point<bigint> = [
    16540640123574156134436876038791482806971768689494387082833631921987005038935n,
    20819045374670962167435360035096875258406992893633759881276124905556507972311n,
  ];

  const privateKey = BigInt(`0x${crypto.randomBytes(32).toString("hex")}`);
  const _publicKey = packPoint(mulPointEscalar(Base8, privateKey));

  const { n, a, t, skLocked } = await createTimeLockPuzzle(privateKey, time);

  const publicKey = toHex(_publicKey);
  const hexPrivateKey = toHex(privateKey);
  const hashedSK = keccak256(hexPrivateKey);
  return {
    publicKey,
    hashedSK,
    n,
    a,
    t,
    skLocked,
  };
};

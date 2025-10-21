"use server";
import crypto from "crypto";
import { modPow } from "bigint-mod-arith";
import { toHex } from "viem";

export const createTimeLockPuzzle = async (skTrusted: bigint, t: bigint) => {
  const { privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096,
  });
  const jwk = privateKey.export({ format: "jwk" }) as {
    n: string;
    p: string;
    q: string;
  };
  const n = BigInt("0x" + Buffer.from(jwk.n, "base64url").toString("hex"));
  const p = BigInt("0x" + Buffer.from(jwk.p, "base64url").toString("hex"));
  const q = BigInt("0x" + Buffer.from(jwk.q, "base64url").toString("hex"));

  const phi = (p - 1n) * (q - 1n);

  const a = 2n;
  const e = modPow(2n, BigInt(t), phi);
  const b = modPow(a, e, n);

  const nBytes = 512;
  const bHex = b.toString(16).padStart(nBytes * 2, "0");
  const keyToXor = crypto
    .createHash("sha256")
    .update(Buffer.from(bHex, "hex"))
    .digest();
  const skBuf = Buffer.from(skTrusted.toString(16).padStart(64, "0"), "hex");

  const S_locked = Buffer.alloc(skBuf.length);
  for (let i = 0; i < skBuf.length; i++) {
    S_locked[i] = skBuf[i] ^ keyToXor[i % keyToXor.length];
  }

  return {
    n: toHex(n),
    a: Number(a),
    t: BigInt(t),
    skLocked: `0x${S_locked.toString("hex")}` as `0x${string}`,
  };
};

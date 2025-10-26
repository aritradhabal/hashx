import crypto from "crypto";
import { modPow } from "bigint-mod-arith";
import { keccak256, toHex } from "viem";
export const createTimeLockPuzzle = (skTrusted: bigint, t: number = 1e5) => {
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
    n: n.toString(16),
    a: a.toString(),
    t,
    sk_Locked: S_locked.toString("hex"),
  };
};

export const solveTimeLockPuzzle = (puzzle: {
  n: string;
  a: number;
  t: string | bigint | number;
  skLocked: string;
}) => {
  const { n, a, t, skLocked } = puzzle;

  const cleanHex = (hex: string) => hex.replace(/^0x/i, "").trim();

  const nHex = cleanHex(n);
  const N = BigInt("0x" + nHex);

  let tBigInt = BigInt(0);
  if (typeof t == "string") {
    tBigInt = BigInt(t);
  } else if (typeof t === "number") {
    tBigInt = BigInt(t);
  } else {
    tBigInt = t;
  }

  let res = BigInt(a);

  for (let i = 0n; i < tBigInt; i++) {
    res = (res * res) % N;
  }

  const nBytes = 512;
  const bHex = res.toString(16).padStart(nBytes * 2, "0");
  const hashB = crypto
    .createHash("sha256")
    .update(Buffer.from(bHex, "hex"))
    .digest();

  const Sbuf = Buffer.from(cleanHex(skLocked), "hex");
  const skRecovered = Buffer.alloc(Sbuf.length);

  for (let i = 0; i < Sbuf.length; i++) {
    skRecovered[i] = Sbuf[i] ^ hashB[i % hashB.length];
  }

  const SK_Recovered = BigInt("0x" + skRecovered.toString("hex"));
  const hexSkRecovered = toHex(SK_Recovered);
  const hashedSK = keccak256(hexSkRecovered);
  return { hexSkRecovered, hashedSK };
};

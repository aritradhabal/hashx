import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import crypto from "crypto";
import { keccak256, toHex } from "viem";

const RESET = "\x1b[0m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const MAGENTA = "\x1b[35m";

function cleanHex(hex: string) {
  return hex.replace(/^0x/i, "").trim();
}

async function main() {
  const rl = readline.createInterface({ input, output });

  const n = (
    await rl.question(
      `${MAGENTA}🧮 Input the value of 'n' from the puzzle: ${RESET}`
    )
  ).trim();
  const aStr = (
    await rl.question(
      `${MAGENTA}🔡 Input the value of 'a' from the puzzle (default 2): ${RESET}`
    )
  ).trim();
  const tStr = (
    await rl.question(
      `${MAGENTA}⏳ Input the value of 't' from the puzzle: ${RESET}`
    )
  ).trim();
  const skLockedIn = (
    await rl.question(
      `${MAGENTA}🔐 Input the value of 'sk_Locked' from the puzzle: ${RESET}`
    )
  ).trim();
  rl.close();

  const start = performance.now();

  const N = BigInt("0x" + cleanHex(n));
  const a: number = aStr ? Number(aStr) : 2;
  const t = BigInt(tStr);

  let res = BigInt(a);
  for (let i = 0n; i < t; i++) {
    res = (res * res) % N;
  }

  const nBytes = 512;
  const bHex = res.toString(16).padStart(nBytes * 2, "0");
  const hashB = crypto
    .createHash("sha256")
    .update(Buffer.from(bHex, "hex"))
    .digest();

  const Sbuf = Buffer.from(cleanHex(skLockedIn), "hex");
  const skRecovered = Buffer.alloc(Sbuf.length);
  for (let i = 0; i < Sbuf.length; i++) {
    skRecovered[i] = Sbuf[i] ^ hashB[i % hashB.length];
  }

  const SK_Recovered = BigInt("0x" + skRecovered.toString("hex"));
  const hexSkRecovered = toHex(SK_Recovered);
  const hashedSK = keccak256(hexSkRecovered);

  const end = performance.now();

  console.log(`${GREEN}🔑 Recovered Secret Key:${RESET}`, hexSkRecovered);
  console.log(
    `${YELLOW}⚡ Execution time: ${(end - start).toFixed(2)} ms ⏱️${RESET}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

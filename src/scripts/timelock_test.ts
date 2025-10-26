import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { createTimeLockPuzzle, solveTimeLockPuzzle } from "./timelock";

function parseSecretKey(inputStr: string): bigint {
  const s = inputStr.trim();
  if (!s) throw new Error("Empty secret key");
  const sNoN = s.endsWith("n") || s.endsWith("N") ? s.slice(0, -1) : s;
  if (/^0x/i.test(sNoN)) return BigInt(sNoN);
  if (/^[0-9a-fA-F]+$/.test(sNoN)) return BigInt("0x" + sNoN);
  if (/^\d+$/.test(sNoN)) return BigInt(sNoN);
  throw new Error(
    "Invalid secret key format. Use decimal or hex (with or without 0x)."
  );
}

function parseTimeToBigInt(inputStr: string): bigint {
  const s = inputStr.trim();
  if (!s) throw new Error("Empty t value");
  if (/^\d+$/.test(s)) return BigInt(s);

  const m = s.match(/^(\d+)(?:\.(\d+))?[eE]([+-]?\d+)$/);
  if (!m)
    throw new Error("Invalid t format. Use integer or scientific (e.g., 1e5).");

  const intPart = m[1];
  const fracPart = m[2] || "";
  const exp = parseInt(m[3], 10);
  if (!Number.isFinite(exp)) throw new Error("Invalid exponent in t");
  if (exp < 0) throw new Error("t must be a non-negative integer");

  let digits = intPart + fracPart;
  const zerosToAdd = exp - fracPart.length;
  if (zerosToAdd >= 0) {
    digits += "0".repeat(zerosToAdd);
  } else {
    // Truncate fractional part (floor)
    digits = digits.slice(0, digits.length + zerosToAdd);
    if (digits.length === 0) digits = "0";
  }
  digits = digits.replace(/^0+/, "") || "0";
  return BigInt(digits);
}

function parseTimeToNumber(inputStr: string): number {
  const big = parseTimeToBigInt(inputStr);
  const max = BigInt(Number.MAX_SAFE_INTEGER);
  if (big > max) throw new Error("t is too large for a safe JS number");
  return Number(big);
}

function measureExecutionTimeofEncryption(sk: bigint, time: number) {
  console.log("🔒 Starting encryption process...");
  const start = performance.now();
  const puzzle = createTimeLockPuzzle(sk, time);
  console.log("🧩 Puzzle created: ", { puzzle });
  const end = performance.now();
  console.log(`⚡ Execution time: ${(end - start).toFixed(2)} ms ⏱️`);
}

function measureExecutionTimeofDecryption(
  n: string,
  aInput: string,
  tInput: string,
  skLockedInput: string
) {
  console.log("🔓 Starting decryption process...");
  const start = performance.now();

  const a = aInput ? Number(aInput) : 2;
  if (!Number.isFinite(a)) {
    throw new Error("Invalid 'a' value. Expecting a number.");
  }

  let tBig: bigint;
  try {
    tBig = parseTimeToBigInt(tInput);
  } catch (e) {
    console.error(
      "❌ Invalid 't'. Use integer or scientific notation like 1e5."
    );
    process.exit(1);
  }

  const puzzle = { n, a, t: tBig, skLocked: skLockedInput.trim() };
  const result = solveTimeLockPuzzle(puzzle);
  console.log("🔑 Recovered Secret Key: ", result.hexSkRecovered);

  const end = performance.now();
  console.log(`⚡ Execution time: ${(end - start).toFixed(2)} ms ⏱️`);
}

async function main() {
  const rl = readline.createInterface({ input, output });
  const userInputValue = (
    await rl.question("⚙️ Encrypt or Decrypt (Enter E or D or q to quit): ")
  ).trim();
  rl.close();

  if (userInputValue === "q" || userInputValue === "Q") {
    console.log("👋 Exiting... Goodbye!");
    return;
  }

  if (userInputValue === "E" || userInputValue === "e") {
    const rl = readline.createInterface({ input, output });
    const targetSKvalueStr = await rl.question(
      "🗝️ Input the SK you want to encrypt (decimal or hex; 0x-prefixed or raw hex): "
    );
    let targetSKvalue: bigint;
    try {
      targetSKvalue = parseSecretKey(targetSKvalueStr);
    } catch {
      console.error(
        "❌ Invalid secret key. Use decimal or hex (with or without 0x)."
      );
      process.exit(1);
    }

    const tStr = await rl.question(
      "⏲️ Enter encryption duration (sequential steps, default: 1e5): "
    );
    rl.close();

    let tNum: number = 1e5;
    if (tStr.trim()) {
      try {
        tNum = parseTimeToNumber(tStr);
      } catch {
        console.error(
          "❌ Invalid 't'. Use integer or scientific notation like 1e5, within safe JS number range."
        );
        process.exit(1);
      }
    }

    measureExecutionTimeofEncryption(targetSKvalue, tNum);
  } else if (userInputValue === "D" || userInputValue === "d") {
    const rl = readline.createInterface({ input, output });
    const targetNvalueStr = await rl.question(
      "🧮 Input the value of 'n' from the puzzle: "
    );
    const targetavalueStr = await rl.question(
      "🔡 Input the value of 'a' from the puzzle (number): "
    );
    const targettvalueStr = await rl.question(
      "⏳ Input the value of 't' from the puzzle: "
    );
    const targetskLockedvalueStr = await rl.question(
      "🔐 Input the value of 'sk_Locked' from the puzzle (hex, with or without 0x): "
    );
    rl.close();
    measureExecutionTimeofDecryption(
      targetNvalueStr,
      targetavalueStr,
      targettvalueStr,
      targetskLockedvalueStr
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

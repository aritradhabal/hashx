"use server";
import { db } from "@/db/index";
import { secrets } from "@/db/schema";

import { eq } from "drizzle-orm";

export interface secretParamsT {
  marketId: bigint;
  N: `0x${string}`;
  t: bigint;
  a: number;
  skLocked: `0x${string}`;
  hashedSK: `0x${string}`;
  publicKey: `0x${string}`;
  secretKey: `0x${string}`;
  verified: boolean;
  server: boolean;
}

export async function addSecrets(secretParams: secretParamsT) {
  try {
    if (
      secretParams.marketId === null ||
      secretParams.N === null ||
      secretParams.t === null ||
      secretParams.a === null ||
      secretParams.skLocked === null ||
      secretParams.hashedSK === null ||
      secretParams.publicKey === null
    ) {
      throw new Error("Missing required fields in args");
    }

    const [inserted] = await db
      .insert(secrets)
      .values({
        marketId: secretParams.marketId,
        N: secretParams.N,
        t: secretParams.t,
        a: secretParams.a,
        skLocked: secretParams.skLocked,
        hashedSK: secretParams.hashedSK,
        publicKey: secretParams.publicKey,
        secretKey:
          secretParams.secretKey ||
          "0x0000000000000000000000000000000000000000",
        verified: false,
        server: secretParams.server,
      })
      .returning();

    return {
      success: true,
      data: inserted,
    };
  } catch (error: any) {
    console.error("❌ Failed to insert voting contract:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

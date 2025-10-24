"use server";
import { unpackPoint, mulPointEscalar } from "@zk-kit/baby-jubjub";
import crypto from "crypto";

export const decryptVote = async (
  encryptedVote: string,
  voterPublicKey: bigint,
  secretKey: string
): Promise<string> => {
  const SecretKeyBigInt = BigInt(secretKey);
  const decryptedVote = await decryptData(
    encryptedVote,
    SecretKeyBigInt,
    BigInt(voterPublicKey)
  );
  return decryptedVote;
};

export const decryptData = async (
  encryptedData: string,
  privateKey: bigint,
  trustedPartyPublicKey: bigint
): Promise<string> => {
  const unpackedKey = unpackPoint(trustedPartyPublicKey);
  if (!unpackedKey) {
    throw new Error("Invalid key");
  }

  const sharedSecretPoint = mulPointEscalar(unpackedKey, privateKey);

  let sharedSecret = sharedSecretPoint[0].toString(16);

  // Pad the shared secret with zeros to make it 32 bytes long.
  while (sharedSecret.length < 64) {
    sharedSecret = "0" + sharedSecret;
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-ctr",
    Buffer.from(sharedSecret, "hex"), // Use the first 32 bytes of the shared secret as the key.
    Buffer.alloc(16, 0) // Use a zero-filled buffer as the IV.
  );
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

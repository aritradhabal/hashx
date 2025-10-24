"use server";
import { packPoint, unpackPoint, mulPointEscalar } from "@zk-kit/baby-jubjub";
import crypto from "crypto";
export const encrypt = async ({
  sig,
  optionValue,
  publicKey,
}: {
  sig: `0x${string}`;
  optionValue: string;
  publicKey: string;
}): Promise<{ encryptedVote: string; userPublicKey: bigint }> => {
  const Base8: [bigint, bigint] = [
    16540640123574156134436876038791482806971768689494387082833631921987005038935n,
    20819045374670962167435360035096875258406992893633759881276124905556507972311n,
  ];

  // Combine typedSig and randomness
  const randomBytes = crypto.randomBytes(32);
  const mixInput = Buffer.concat([
    Buffer.from(sig.slice(2), "hex"),
    randomBytes,
  ]);

  // Derive private key as a hash of both
  const hash = crypto.createHash("sha256").update(mixInput).digest("hex");
  const privateKey = BigInt(`0x${hash}`);

  // Ensure it fits in curve order (BabyJubJub subgroup order)
  const order =
    21888242871839275222246405745257275088548364400416034343698204186575808495617n;
  const userPrivateKey = privateKey % order;

  const userPublicKey = packPoint(mulPointEscalar(Base8, userPrivateKey));

  const encryptedVoteData = await encryptVote(
    optionValue,
    userPrivateKey,
    userPublicKey,
    publicKey
  );
  return {
    encryptedVote: `0x${encryptedVoteData.encryptedVote}`,
    userPublicKey: userPublicKey,
  };
};

export const encryptVote = async (
  vote: string,
  userPrivateKey: bigint,
  userPublicKey: bigint,
  trustedPartypublicKey: string
) => {
  const encryptedVote = await encryptData(
    vote,
    userPrivateKey,
    userPublicKey,
    BigInt(trustedPartypublicKey)
  );

  return {
    encryptedVote,
    publicKey: userPublicKey,
  };
};

export const encryptData = async (
  data: string,
  privateKey: bigint,
  voterPublicKey: bigint,
  trustedPartyKey: bigint
) => {
  // Compute the shared secret by multiplying the trusted party's public key by the private key.
  const unpackedKey = unpackPoint(trustedPartyKey);
  if (!unpackedKey) {
    throw new Error("Invalid key");
  }
  const sharedSecretPoint = mulPointEscalar(unpackedKey, privateKey);

  let sharedSecret = sharedSecretPoint[0].toString(16);

  // Pad the shared secret with zeros to make it 32 bytes long.
  while (sharedSecret.length < 64) {
    sharedSecret = "0" + sharedSecret;
  }

  const cipher = crypto.createCipheriv(
    "aes-256-ctr",
    Buffer.from(sharedSecret, "hex"), // Use the first 32 bytes of the shared secret as the key.
    Buffer.alloc(16, 0) // Use a zero-filled buffer as the IV.
  );
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");

  return encrypted;
};

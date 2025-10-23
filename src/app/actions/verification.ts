"use server";
import { SiweMessage, generateNonce } from "siwe";
import { recoverTypedDataAddress, isAddressEqual } from "viem";

export async function getNonce() {
  const nonce = generateNonce();

  return nonce;
}

export async function verify(message: string, signature: string) {
  try {
    const siweMessage = new SiweMessage(message);
    const result = await siweMessage.verify({ signature });
    if (result.success) {
      return result.success;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

export async function verifyVoteSignature({
  signature,
  expectedSigner,
  contractAddress,
  chainId,
  marketId,
  option,
  amount,
}: {
  signature: `0x${string}`;
  expectedSigner: `0x${string}`;
  contractAddress: `0x${string}`;
  chainId: number;
  marketId: bigint;
  option: string;
  amount: bigint;
}): Promise<boolean> {
  const domain = {
    name: "HashX",
    version: "1",
    chainId,
    verifyingContract: contractAddress,
  } as const;

  const types = {
    Vote: [
      { name: "marketId", type: "uint256" },
      { name: "option", type: "string" },
      { name: "amount", type: "uint256" },
    ],
  } as const;

  const message = { marketId, option, amount } as const;

  const recovered = await recoverTypedDataAddress({
    domain,
    types,
    primaryType: "Vote",
    message,
    signature,
  });

  return isAddressEqual(recovered, expectedSigner);
}

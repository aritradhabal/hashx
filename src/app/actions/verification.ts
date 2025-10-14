"use server";
import { SiweMessage, generateNonce } from "siwe";

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

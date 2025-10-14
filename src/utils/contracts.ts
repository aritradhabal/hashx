import {
  HBAR_LOCKING_CONTRACT_ABI,
  HBAR_LOCKING_CONTRACT_ADDRESS,
} from "@/constants";

export const wagmiContractConfig = {
  address: HBAR_LOCKING_CONTRACT_ADDRESS,
  abi: HBAR_LOCKING_CONTRACT_ABI,
} as const;

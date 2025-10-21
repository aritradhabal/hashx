import {
  HBAR_LOCKING_CONTRACT_ABI,
  HBAR_LOCKING_CONTRACT_ADDRESS,
  CREATEVOTE_FACTORY_ADDRESS,
  CREATEVOTE_FACTORY_ABI,
} from "@/constants";
export const wagmiContractConfig = {
  address: HBAR_LOCKING_CONTRACT_ADDRESS,
  abi: HBAR_LOCKING_CONTRACT_ABI,
} as const;

export const CreateVoteFactoryContractConfig = {
  address: CREATEVOTE_FACTORY_ADDRESS,
  abi: CREATEVOTE_FACTORY_ABI,
} as const;

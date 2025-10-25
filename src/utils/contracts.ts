import {
  HBAR_LOCKING_CONTRACT_ABI,
  HBAR_LOCKING_CONTRACT_ADDRESS,
  CREATEVOTE_FACTORY_ADDRESS,
  CREATEVOTE_FACTORY_ABI,
  CREATEVOTE_ABI,
  PREDICT_MARKET_FACTORY_ABI,
  PREDICT_MARKET_FACTORY_ADDRESS,
} from "@/constants";
export const wagmiContractConfig = {
  address: HBAR_LOCKING_CONTRACT_ADDRESS,
  abi: HBAR_LOCKING_CONTRACT_ABI,
} as const;

export const CreateVoteFactoryContractConfig = {
  address: CREATEVOTE_FACTORY_ADDRESS,
  abi: CREATEVOTE_FACTORY_ABI,
} as const;

export const CreateVoteContractConfig = {
  abi: CREATEVOTE_ABI,
} as const;

export const PredictionMarketFactoryContractConfig = {
  address: PREDICT_MARKET_FACTORY_ADDRESS,
  abi: PREDICT_MARKET_FACTORY_ABI,
} as const;

import HBARLockingContractABI from "../ABI/LockingContract.json" with { type: "json" };
import FactoryContractABI from "../ABI/CreateVoteFactory.json"
import CreateVoteContractABI from "../ABI/CreateVote.json"
import PredictMarketFactoryContractABI from "../ABI/PredictionMarketFactory.json"

export const HBAR_LOCKING_CONTRACT_ADDRESS =
  "0xde368C3DCac4E5096f2D2b8AF7Be70277c43b144";
export const CREATEVOTE_FACTORY_ADDRESS =
  "0x17702bB3d6f5b1b6D9eDd6eA986dBbE5F2903aB0";
export const PREDICT_MARKET_FACTORY_ADDRESS =
  "0xaDD6fA0f89977ece20b8f2CcbD79B6193A926428";

export const HBAR_LOCKING_CONTRACT_ABI = HBARLockingContractABI.abi;
export const CREATEVOTE_FACTORY_ABI = FactoryContractABI.abi;
export const CREATEVOTE_ABI = CreateVoteContractABI.abi;
export const PREDICT_MARKET_FACTORY_ABI = PredictMarketFactoryContractABI.abi;

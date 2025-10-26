import HBARLockingContractABI from "../ABI/LockingContract.json" with { type: "json" };
import FactoryContractABI from "../ABI/CreateVoteFactory.json"
import CreateVoteContractABI from "../ABI/CreateVote.json"
import PredictMarketFactoryContractABI from "../ABI/PredictionMarketFactory.json"
import PredictionMarketContractABI from "../ABI/PredictionMarket.json"

export const HBAR_LOCKING_CONTRACT_ADDRESS =
  "0xde368C3DCac4E5096f2D2b8AF7Be70277c43b144";
export const CREATEVOTE_FACTORY_ADDRESS =
  "0xa64E392844e35d588346CAC760981ff399Ee95aE";
export const PREDICT_MARKET_FACTORY_ADDRESS =
  "0x0118250132B55af4Ca1659dA51Bf7430245C1A03";

export const HBAR_LOCKING_CONTRACT_ABI = HBARLockingContractABI.abi;
export const CREATEVOTE_FACTORY_ABI = FactoryContractABI.abi;
export const CREATEVOTE_ABI = CreateVoteContractABI.abi;
export const PREDICT_MARKET_FACTORY_ABI = PredictMarketFactoryContractABI.abi;
export const PREDICTION_MARKET_ABI = PredictionMarketContractABI.abi;
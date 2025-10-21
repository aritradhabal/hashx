import HBARLockingContractABI from "../ABI/HBARlockingContract.json" with { type: "json" };
import FactoryContractABI from "../ABI/CreateVoteFactory.json"
import CreateVoteContractABI from "../ABI/CreateVote.json"

export const HBAR_LOCKING_CONTRACT_ADDRESS =
  "0xde368C3DCac4E5096f2D2b8AF7Be70277c43b144";
export const CREATEVOTE_FACTORY_ADDRESS =
  "0xfdCc98789Ed1729d713c865878b104ee81e960f3";

export const HBAR_LOCKING_CONTRACT_ABI = HBARLockingContractABI.abi;
export const CREATEVOTE_FACTORY_ABI = FactoryContractABI.abi;
export const CREATEVOTE_ABI = CreateVoteContractABI.abi;
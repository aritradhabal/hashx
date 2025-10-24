import HBARLockingContractABI from "../ABI/LockingContract.json" with { type: "json" };
import FactoryContractABI from "../ABI/CreateVoteFactory.json"
import CreateVoteContractABI from "../ABI/CreateVote.json"

export const HBAR_LOCKING_CONTRACT_ADDRESS =
  "0xde368C3DCac4E5096f2D2b8AF7Be70277c43b144";
export const CREATEVOTE_FACTORY_ADDRESS =
  "0x9193e8965093e6c226C77362537323A116A2f415";

export const HBAR_LOCKING_CONTRACT_ABI = HBARLockingContractABI.abi;
export const CREATEVOTE_FACTORY_ABI = FactoryContractABI.abi;
export const CREATEVOTE_ABI = CreateVoteContractABI.abi;


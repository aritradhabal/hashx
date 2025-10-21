import HBARLockingContractABI from "../ABI/HBARLockingContract/HBARlockingContract.json" with { type: "json" };
import FactoryContractABI from "../ABI/CreateVoteFactory/CreateVoteFactory.json"

export const HBAR_LOCKING_CONTRACT_ADDRESS =
  "0xde368C3DCac4E5096f2D2b8AF7Be70277c43b144";
export const CREATEVOTE_FACTORY_ADDRESS =
  "0xe2A81D63ad163d855C3C4E62405ad1b7bC68D371";

export const HBAR_LOCKING_CONTRACT_ABI = HBARLockingContractABI.abi;
export const CREATEVOTE_FACTORY_ABI = FactoryContractABI.abi;
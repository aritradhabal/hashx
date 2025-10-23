import { create } from "zustand";
import { readContract } from "@wagmi/core";
import { Address, formatEther } from "viem";
import { wagmiContractConfig } from "@/utils/contracts";
import { config } from "@/utils/WagmiConfig";
import { useNativeBalanceStore } from "./useNativeBalanceStore";

const fetchStakedTokenBalance = async (address: Address) => {
  if (!address) return "0.00";
  let userStakedTokenBalance = "0.00";
  try {
    const rawStakedTokenBalance = await readContract(config as any, {
      abi: wagmiContractConfig.abi,
      address: wagmiContractConfig.address,
      functionName: "checkUserDeposit",
      args: [address],
    });
    userStakedTokenBalance = Math.floor(
      Number(rawStakedTokenBalance as bigint) / 1e8
    ).toString();
  } catch (error) {
    console.error("Failed to fetch balance:", error);
  }
  return userStakedTokenBalance;
};
interface TokenBalanceStore {
  address: Address;
  balance: string;
  isLoading: boolean;
  isError: boolean;
  setAddress: (address: Address) => void;
  setBalance: (balance: string) => void;
  fetchBalance: () => Promise<void>;
}
useNativeBalanceStore.subscribe((state) => {
  useTokenBalanceStore.setState({ address: state.address as Address });
});

export const useTokenBalanceStore = create<TokenBalanceStore>((set, get) => ({
  address: useNativeBalanceStore.getState().address as Address,
  balance: "0.00",
  isLoading: false,
  isError: false,
  setAddress: (address: Address) => set({ address }),
  setBalance: (balance: string) => set({ balance }),
  fetchBalance: async () => {
    set({ isLoading: true });
    try {
      const balance = await fetchStakedTokenBalance(get().address as Address);
      set({ balance });
      set({ isError: false });
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      set({ balance: "0.00" });
      set({ isError: true });
    } finally {
      set({ isLoading: false });
    }
  },
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
}));

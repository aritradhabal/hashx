import { create } from "zustand";
import { getBalance } from "@wagmi/core";
import { config } from "@/utils/WagmiConfig";
import { Address, formatEther } from "viem";

const fetchNativeBalance = async (address: Address) => {
  let formattedBalance = "0.00";
  try {
    const data = await getBalance(config as any, {
      //@ts-ignore
      address: address,
    });
    formattedBalance = parseFloat(formatEther(data.value)).toFixed(2);
  } catch (error) {
    console.error("Failed to fetch balance:", error);
  }

  return formattedBalance;
};

interface NativeBalanceStore {
  address: Address | null;
  balance: string;
  isLoading: boolean;
  isError: boolean;
  setAddress: (address: Address) => void;
  setBalance: (balance: string) => void;
  fetchBalance: () => Promise<void>;
  setIsLoading: (isLoading: boolean) => void;
}

export const useNativeBalanceStore = create<NativeBalanceStore>((set, get) => ({
  address: null,
  balance: "0.00",
  isLoading: false,
  isError: false,
  setAddress: (address: Address) => set({ address }),
  setBalance: (balance: string) => set({ balance }),
  fetchBalance: async () => {
    const { address } = get();
    if (!address) return;
    set({ isLoading: true });
    try {
      const balance = await fetchNativeBalance(address);
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

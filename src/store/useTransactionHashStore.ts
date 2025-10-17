import { create } from "zustand";

interface TransactionHashStore {
  transactionHash: string | undefined;
  setTransactionHash: (transactionHash: string) => void;
}
export const useTransactionHashStore = create<TransactionHashStore>((set) => ({
  transactionHash: undefined,
  setTransactionHash: (transactionHash: string) => set({ transactionHash }),
}));

import type { VoteCardData } from "@/actions/types";
import {
  getActiveVotes,
  getUpcomingVotes,
  getResolvedVotes,
} from "@/actions/db-actions";

export const fetchContracts = async (
  activeTab: "Ongoing" | "Resolved" | "Upcoming"
): Promise<{ success: boolean; data?: VoteCardData[] }> => {
  if (activeTab === "Ongoing") {
    const { success, data } = await getActiveVotes();
    if (!success) {
      console.error("Failed to fetch data");
      return { success: false };
    }
    return { success: true, data: data };
  }
  if (activeTab === "Resolved") {
    const { success, data } = await getResolvedVotes();
    if (!success) {
      console.error("Failed to fetch data");
      return { success: false };
    }
    return { success: true, data: data };
  }
  if (activeTab === "Upcoming") {
    const { success, data } = await getUpcomingVotes();
    if (!success) {
      console.error("Failed to fetch data");
      return { success: false };
    }
    return { success: true, data: data };
  }
  return { success: true };
};

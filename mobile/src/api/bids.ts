import apiClient from "./client";
import { BidItem } from "../types";

export interface PlaceBidPayload {
  jobId: string;
  price: number;
  estimatedDuration: string;
  note?: string;
  boost?: boolean;
}

export const bidsApi = {
  /**
   * Fetch all bids submitted for a specific job
   */
  getBidsForJob: async (jobId: string): Promise<BidItem[]> => {
    const res = await apiClient.get(`/bids/job/${jobId}`);
    return res.data;
  },

  /**
   * Place a new bid on a job (Provider)
   */
  placeBid: async (payload: PlaceBidPayload): Promise<{ success: boolean; bid: BidItem }> => {
    const res = await apiClient.post("/bids", payload);
    return res.data;
  },

  /**
   * Accept a provider's bid (Customer)
   */
  acceptBid: async (bidId: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.patch(`/bids/${bidId}/accept`);
    return res.data;
  },
};

export default bidsApi;

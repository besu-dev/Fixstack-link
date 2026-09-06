import { ProviderDetails } from "./user.types";

export type BidStatus = "pending" | "accepted" | "rejected";

export interface BidItem {
  _id: string;
  job: string;
  provider: ProviderDetails;
  price: number;
  estimatedDuration: string;
  note?: string;
  status: BidStatus;
  isBoosted: boolean;
  connectsUsed?: number;
  createdAt: string;
}

export type Bid = BidItem;

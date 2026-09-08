import { Job, JobUrgency } from "./job.types";

export interface NotificationProvider {
  _id: string;
  fullName: string;
  avatarUrl?: string;
  profession?: string;
  rating?: number;
  isVerified?: boolean;
  phone?: string;
}

export interface JobNotification {
  _id: string;
  recipient: string;
  job: Job;
  type: string;
  serviceName: string;
  jobTitle: string;
  location: string;
  budget: number;
  urgency: JobUrgency;
  timePosted?: string;
  // Proposal-specific fields
  provider?: NotificationProvider;
  providerName?: string;
  proposalPrice?: number;
  proposalStatus?: "pending" | "accepted" | "rejected";
  proposalId?: string;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UnreadCountResponse {
  count: number;
}


import { CustomerDetails, ProviderDetails } from "./user.types";

export type JobUrgency = "Emergency" | "Today" | "Flexible";
export type JobStatus = "open" | "assigned" | "completed" | "cancelled";

export interface JobReview {
  _id?: string;
  rating: number;
  comment?: string;
  createdAt?: string;
}

export interface Job {
  _id: string;
  title: string;
  category: string;
  description: string;
  subcity: string;
  specificLocation?: string;
  budget: number;
  urgency: JobUrgency;
  photos?: string[];
  status: JobStatus;
  createdAt: string;
  customer?: CustomerDetails;
  assignedProvider?: ProviderDetails;
  rating?: number;
  review?: string | JobReview;
  reviewDetails?: JobReview;
  isReviewed?: boolean;
}

export type CustomerJob = Job;

import { Job, JobUrgency } from "./job.types";

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
  read: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UnreadCountResponse {
  count: number;
}

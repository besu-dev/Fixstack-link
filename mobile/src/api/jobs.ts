import apiClient from "./client";
import { Job } from "../types";

export const jobsApi = {
  /**
   * Fetch jobs posted by the currently authenticated customer
   */
  getMyJobs: async (): Promise<Job[]> => {
    const res = await apiClient.get("/jobs/my-jobs");
    return res.data;
  },

  /**
   * Fetch open jobs for service providers with optional query parameters
   */
  getAvailableJobs: async (params?: { category?: string; search?: string }): Promise<Job[]> => {
    const res = await apiClient.get("/jobs", { params });
    return res.data;
  },

  /**
   * Fetch a single job by its ID
   */
  getJobById: async (jobId: string): Promise<Job> => {
    const res = await apiClient.get(`/jobs/${jobId}`);
    return res.data;
  },

  /**
   * Mark a job as completed
   */
  markJobCompleted: async (jobId: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.patch(`/jobs/${jobId}/complete`);
    return res.data;
  },

  /**
   * Submit a rating and review for a completed job
   */
  submitReview: async (
    jobId: string,
    reviewData: { rating: number; reviewText: string }
  ): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.post(`/jobs/${jobId}/review`, reviewData);
    return res.data;
  },
};

export default jobsApi;

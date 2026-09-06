import { useState, useEffect, useCallback } from "react";
import { Alert } from "../context/AlertContext";
import { Job, BidItem } from "../types";
import { jobsApi, bidsApi } from "../api";

export const useCustomerOrders = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Proposals Review Modal State
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobBids, setJobBids] = useState<BidItem[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [bidsModalVisible, setBidsModalVisible] = useState(false);
  const [acceptingBidId, setAcceptingBidId] = useState<string | null>(null);

  // Review Modal State
  const [ratingJob, setRatingJob] = useState<Job | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      const data = await jobsApi.getMyJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to fetch customer orders:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
  };

  // Open proposals review sheet
  const handleOpenProposals = async (job: Job) => {
    setSelectedJob(job);
    setBidsModalVisible(true);
    setLoadingBids(true);
    try {
      const data = await bidsApi.getBidsForJob(job._id);
      setJobBids(Array.isArray(data) ? data : []);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Could not load quotes."
      );
    } finally {
      setLoadingBids(false);
    }
  };

  // Accept Quote Handler
  const handleAcceptBid = async (
    bid: BidItem,
    onSuccess: (bid: BidItem) => void
  ) => {
    Alert.alert(
      "Hire Technician",
      `Accept quote of ${bid.price} ETB from ${bid.provider.fullName}? This will assign the job.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm & Hire",
          style: "default",
          onPress: async () => {
            setAcceptingBidId(bid._id);
            try {
              await bidsApi.acceptBid(bid._id);
              setBidsModalVisible(false);
              onSuccess(bid);
              fetchJobs();
            } catch (err: any) {
              Alert.alert(
                "Failed to Accept",
                err.response?.data?.message || "Could not accept quote."
              );
            } finally {
              setAcceptingBidId(null);
            }
          },
        },
      ]
    );
  };

  // Complete Job Handler
  const handleCompleteJob = (job: Job) => {
    Alert.alert(
      "Mark Job as Completed?",
      `Has ${job.assignedProvider?.fullName || "the technician"} finished all requested repairs to your satisfaction?`,
      [
        { text: "Not Yet", style: "cancel" },
        {
          text: "Yes, Completed",
          style: "default",
          onPress: async () => {
            try {
              await jobsApi.markJobCompleted(job._id);
              fetchJobs();
              // Prompt review immediately after completing
              setRatingJob(job);
              setReviewModalVisible(true);
            } catch (err: any) {
              Alert.alert(
                "Error",
                err.response?.data?.message || "Could not complete job."
              );
            }
          },
        },
      ]
    );
  };

  return {
    jobs,
    loading,
    refreshing,
    onRefresh,
    fetchJobs,

    // Bids Modal
    bidsModalVisible,
    setBidsModalVisible,
    selectedJob,
    jobBids,
    loadingBids,
    acceptingBidId,
    handleOpenProposals,
    handleAcceptBid,

    // Review Modal
    ratingJob,
    setRatingJob,
    reviewModalVisible,
    setReviewModalVisible,

    handleCompleteJob,
  };
};

export default useCustomerOrders;

import Bid from "../models/Bid.js";
import Job from "../models/Job.js";

// @desc    Submit a quote/bid for a job
// @route   POST /api/bids
// @access  Private (Provider)
export const placeBid = async (req, res) => {
  try {
    const { jobId, price, estimatedDuration, note } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.status !== "open") {
      return res
        .status(400)
        .json({ message: "This job is no longer accepting bids" });
    }

    // Check if provider already bid on this job
    const existingBid = await Bid.findOne({
      job: jobId,
      provider: req.user._id,
    });
    if (existingBid) {
      return res
        .status(400)
        .json({ message: "You have already submitted a bid for this job" });
    }

    const bid = await Bid.create({
      job: jobId,
      provider: req.user._id,
      price: Number(price),
      estimatedDuration: estimatedDuration || "1-2 hours",
      note: note || "",
    });

    res.status(201).json(bid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bids for a specific job
// @route   GET /api/bids/job/:jobId
// @access  Private
export const getBidsForJob = async (req, res) => {
  try {
    const bids = await Bid.find({ job: req.params.jobId })
      .populate("provider", "fullName phone profession rating isVerified")
      .sort({ price: 1 });

    res.status(200).json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Customer accepts a bid
// @route   PATCH /api/bids/:bidId/accept
// @access  Private (Customer)
export const acceptBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId).populate("job");
    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    // Assign provider, mark job assigned, and store agreed quote price
    await Job.findByIdAndUpdate(bid.job._id, {
      status: "assigned",
      assignedProvider: bid.provider,
      budget: bid.price,
    });

    // Mark this bid as accepted and reject others
    bid.status = "accepted";
    await bid.save();

    await Bid.updateMany(
      { job: bid.job._id, _id: { $ne: bid._id } },
      { status: "rejected" },
    );

    res.status(200).json({ message: "Bid accepted successfully", bid });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

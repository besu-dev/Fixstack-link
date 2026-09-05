import Bid from "../models/Bid.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import WalletTransaction from "../models/WalletTransaction.js";

// @desc    Submit a quote/bid for a job using Connects only (Zero transaction fees)
// @route   POST /api/bids
// @access  Private (Provider)
export const placeBid = async (req, res) => {
  try {
    const { jobId, price, estimatedDuration, note, isBoosted } = req.body;

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

    // 1. Calculate connects required
    const quoteAmount = Number(price);
    const baseConnects = quoteAmount > 1000 ? 4 : 2;
    const boostConnects = isBoosted ? 5 : 0;
    const totalConnectsRequired = baseConnects + boostConnects;

    // 2. Verify technician connects balance
    const providerUser = await User.findById(req.user._id);
    const currentBalance = providerUser?.connectsBalance || 0;

    if (currentBalance < totalConnectsRequired) {
      return res.status(402).json({
        message: `Insufficient connects. Submitting this quote requires ${totalConnectsRequired} connects (${baseConnects} base ${
          isBoosted ? "+ 5 boost" : ""
        }), but you currently have ${currentBalance}.`,
        requiredConnects: totalConnectsRequired,
        currentBalance,
      });
    }

    // 3. Create Bid record (Zero payment/service fees)
    const bid = await Bid.create({
      job: jobId,
      provider: req.user._id,
      price: quoteAmount,
      estimatedDuration: estimatedDuration || "1-2 hours",
      note: note || "",
      connectsSpent: baseConnects,
      isBoosted: Boolean(isBoosted),
      boostConnectsSpent: boostConnects,
    });

    // 4. Deduct connects from provider's account
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { connectsBalance: -totalConnectsRequired },
    });

    // 5. Log connects deduction in WalletTransaction
    await WalletTransaction.create({
      user: req.user._id,
      type: "bid_deduction",
      connects: -baseConnects,
      paymentMethod: "wallet_deduction",
      status: "completed",
    });

    if (isBoosted) {
      await WalletTransaction.create({
        user: req.user._id,
        type: "proposal_boost",
        connects: -boostConnects,
        paymentMethod: "wallet_deduction",
        status: "completed",
      });
    }

    const populatedBid = await bid.populate(
      "provider",
      "fullName phone profession rating isVerified isFeatured",
    );

    res.status(201).json(populatedBid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bids for a job (Boosted bids rank at the top)
// @route   GET /api/bids/job/:jobId
// @access  Private
export const getBidsForJob = async (req, res) => {
  try {
    const bids = await Bid.find({ job: req.params.jobId })
      .populate(
        "provider",
        "fullName phone profession rating isVerified isFeatured",
      )
      // Boosted proposals sit first (-1), followed by earliest submission
      .sort({ isBoosted: -1, createdAt: 1 });

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

    // Assign provider, mark job assigned, and keep agreed price intact (no fee deduction)
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

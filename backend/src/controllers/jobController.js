import Job from "../models/Job.js";
import User from "../models/User.js";
import Review from "../models/Review.js";
import WalletTransaction from "../models/WalletTransaction.js";
import Notification from "../models/Notification.js";

/**
 * Helper to match providers offering the relevant service or skills for a job
 */
export const findMatchingProviders = async (job) => {
  // Query all providers with notifications enabled, excluding the customer who created the job
  const providers = await User.find({
    role: "provider",
    _id: { $ne: job.customer },
    notificationsEnabled: { $ne: false },
  });

  const categoryLower = (job.category || "").toLowerCase().trim();
  const titleLower = (job.title || "").toLowerCase().trim();
  const descLower = (job.description || "").toLowerCase().trim();

  // Extract keywords from category (e.g., "Plumbing", "Electrical", "Solar", "Mitad", "Gate")
  const categoryKeywords = categoryLower
    .split(/[\s,&/]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2);

  return providers.filter((provider) => {
    const profLower = (provider.profession || "").toLowerCase().trim();

    // 1. General Maintenance covers all service requests, or if job is General Maintenance
    if (profLower.includes("general") || categoryLower.includes("general")) {
      return true;
    }

    // 2. Direct profession match or keyword overlap
    if (
      profLower.includes(categoryLower) ||
      categoryLower.includes(profLower) ||
      categoryKeywords.some((kw) => profLower.includes(kw))
    ) {
      return true;
    }

    // 3. Provider skills matching job category, title, description, or keywords
    if (Array.isArray(provider.skills) && provider.skills.length > 0) {
      const hasSkillMatch = provider.skills.some((skill) => {
        const sLower = (skill || "").toLowerCase().trim();
        if (!sLower) return false;
        return (
          categoryLower.includes(sLower) ||
          sLower.includes(categoryLower) ||
          titleLower.includes(sLower) ||
          descLower.includes(sLower) ||
          categoryKeywords.some((kw) => sLower.includes(kw))
        );
      });
      if (hasSkillMatch) {
        return true;
      }
    }

    return false;
  });
};

// @desc    Create a new job request with connects deduction (0 cash fee)
// @route   POST /api/jobs
// @access  Private (Customer)
export const createJob = async (req, res) => {
  try {
    const {
      category,
      title,
      description,
      subcity,
      specificLocation,
      budget,
      urgency,
    } = req.body;

    // 1. Calculate required connects: 3 base connects + 5 for Emergency boost
    const requiredConnects = urgency === "Emergency" ? 8 : 3;

    // 2. Check balance with fallback to 0
    const customer = await User.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentBalance = customer.connectsBalance || 0;
    if (currentBalance < requiredConnects) {
      return res.status(402).json({
        message: `Insufficient connects. Posting this job requires ${requiredConnects} connects (${
          urgency === "Emergency" ? "3 base + 5 emergency boost" : "3 base"
        }). Your current balance is ${currentBalance}.`,
        requiredConnects,
        currentBalance,
      });
    }

    // 3. Normalize file paths (converts Windows \ to URL-friendly /)
    const photoUrls = req.files
      ? req.files.map((file) => file.path.replace(/\\/g, "/"))
      : [];

    // 4. Create the job record
    const newJob = await Job.create({
      customer: customer._id,
      category,
      title,
      description,
      subcity,
      specificLocation,
      budget: Number(budget),
      urgency,
      photos: photoUrls,
    });

    // 5. Atomic balance deduction
    const updatedUser = await User.findByIdAndUpdate(
      customer._id,
      { $inc: { connectsBalance: -requiredConnects } },
      { new: true },
    );

    // 6. Record transaction ledger entry
    await WalletTransaction.create({
      user: customer._id,
      type: "job_post_deduction",
      amountETB: 0,
      connects: -requiredConnects,
      paymentMethod: "wallet_deduction",
      status: "completed",
    });

    // 7. Automatically notify matching service providers
    try {
      const matchingProviders = await findMatchingProviders(newJob);

      if (matchingProviders.length > 0) {
        const locationString =
          [newJob.subcity, newJob.specificLocation]
            .filter(Boolean)
            .join(" - ")
            .trim() || newJob.subcity || "Addis Ababa";

        const notificationsData = matchingProviders.map((provider) => ({
          recipient: provider._id,
          job: newJob._id,
          type: "new_job_alert",
          serviceName: newJob.category || "General Maintenance",
          jobTitle: newJob.title,
          location: locationString,
          budget: newJob.budget,
          urgency: newJob.urgency || "Today",
          timePosted: "Just now",
          read: false,
        }));

        const createdNotifications = await Notification.insertMany(notificationsData);

        // Broadcast real-time Socket.io event if io is mounted
        const io = req.app.get("io");
        if (io) {
          createdNotifications.forEach((notif) => {
            io.to(`user_${notif.recipient}`).emit("new_job_notification", notif);
          });
        }
      }
    } catch (notifErr) {
      console.error("Error creating job alert notifications:", notifErr);
    }

    res.status(201).json({
      job: newJob,
      remainingConnects: updatedUser.connectsBalance,
      deductedConnects: requiredConnects,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all open jobs (filterable by category or subcity)
// @route   GET /api/jobs
// @access  Private
export const getJobs = async (req, res) => {
  try {
    const { category, subcity } = req.query;
    const filter = { status: "open" };

    if (category) filter.category = category;
    if (subcity) filter.subcity = subcity;

    // Emergency jobs appear first, followed by newest
    const jobs = await Job.find(filter)
      .populate("customer", "fullName phone")
      .sort({ urgency: -1, createdAt: -1 });

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all jobs created by the authenticated customer
// @route   GET /api/jobs/my-jobs
// @access  Private (Customer)
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ customer: req.user._id })
      .populate(
        "assignedProvider",
        "fullName phone profession rating isFeatured",
      )
      .sort({ createdAt: -1 })
      .lean();

    // Fetch and link reviews specifically created for these jobs
    const jobIds = jobs.map((j) => j._id);
    const reviews = await Review.find({ job: { $in: jobIds } }).lean();

    const reviewMap = {};
    reviews.forEach((r) => {
      reviewMap[r.job.toString()] = r;
    });

    const jobsWithReviews = jobs.map((job) => {
      const rev = reviewMap[job._id.toString()];
      return {
        ...job,
        rating: rev ? rev.rating : job.rating || null,
        review: rev ? rev.comment : (typeof job.review === "object" ? job.review?.comment : job.review) || null,
        reviewDetails: rev || (job.rating ? { rating: job.rating, comment: job.review } : null),
        isReviewed: Boolean(rev || job.rating),
      };
    });

    res.status(200).json(jobsWithReviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single job details
// @route   GET /api/jobs/:id
// @access  Private
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("customer", "fullName phone")
      .populate(
        "assignedProvider",
        "fullName phone profession rating isFeatured",
      );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark job as completed
// @route   PATCH /api/jobs/:id/complete
// @access  Private
export const markJobCompleted = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.status = "completed";
    await job.save();

    res
      .status(200)
      .json({ message: "Job marked as completed successfully", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Customer leaves a review and updates provider average rating
// @route   POST /api/jobs/:id/rate-review (or /api/jobs/:id/review)
// @access  Private (Customer)
export const reviewJob = async (req, res) => {
  try {
    const { rating, comment, review: reviewBodyText, reviewText } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (!job.assignedProvider) {
      return res
        .status(400)
        .json({ message: "No provider assigned to this job" });
    }

    const existingReview = await Review.findOne({ job: job._id });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this service" });
    }

    // Support 'comment', 'review', and 'reviewText' naming from req.body
    const finalComment = comment || reviewBodyText || reviewText || "";

    const review = await Review.create({
      job: job._id,
      customer: req.user._id,
      provider: job.assignedProvider,
      rating: Number(rating),
      comment: finalComment,
    });

    // Also update legacy/embedded fields on Job if your schema uses them
    job.rating = Number(rating);
    job.review = { rating: Number(rating), comment: finalComment };
    await job.save();

    // Recalculate provider average rating
    const allReviews = await Review.find({ provider: job.assignedProvider });
    const avgRating =
      allReviews.reduce((sum, item) => sum + item.rating, 0) /
      allReviews.length;

    await User.findByIdAndUpdate(job.assignedProvider, {
      rating: parseFloat(avgRating.toFixed(1)),
    });

    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all jobs assigned to the logged-in provider with attached reviews
// @route   GET /api/jobs/provider-tasks
// @access  Private (Provider)
export const getProviderTasks = async (req, res) => {
  try {
    const tasks = await Job.find({ assignedProvider: req.user._id })
      .populate("customer", "fullName phone")
      .sort({ updatedAt: -1 })
      .lean();

    const taskIds = tasks.map((t) => t._id);
    const reviews = await Review.find({ job: { $in: taskIds } }).lean();

    const reviewMap = {};
    reviews.forEach((r) => {
      reviewMap[r.job.toString()] = r;
    });

    const tasksWithReviews = tasks.map((task) => ({
      ...task,
      review: reviewMap[task._id.toString()] || task.review || null,
    }));

    res.status(200).json(tasksWithReviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

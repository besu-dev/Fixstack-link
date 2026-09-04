import Job from "../models/Job.js";
import User from "../models/User.js";
import Review from "../models/Review.js";

// @desc    Create a new job request
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

    // Normalize Windows backslashes (\) to forward slashes (/) for URLs
    const photoUrls = req.files
      ? req.files.map((file) => file.path.replace(/\\/g, "/"))
      : [];

    const newJob = await Job.create({
      customer: req.user._id,
      category,
      title,
      description,
      subcity,
      specificLocation,
      budget: Number(budget),
      urgency,
      photos: photoUrls,
    });

    res.status(201).json(newJob);
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

    const jobs = await Job.find(filter)
      .populate("customer", "fullName phone")
      .sort({ createdAt: -1 });

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
      .populate("assignedProvider", "fullName phone profession rating")
      .sort({ createdAt: -1 });

    res.status(200).json(jobs);
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
      .populate("assignedProvider", "fullName phone profession rating");

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
// @route   POST /api/jobs/:id/review
// @access  Private (Customer)
export const reviewJob = async (req, res) => {
  try {
    const { rating, comment } = req.body;
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

    const review = await Review.create({
      job: job._id,
      customer: req.user._id,
      provider: job.assignedProvider,
      rating: Number(rating),
      comment: comment || "",
    });

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

    // Look up reviews for completed tasks
    const taskIds = tasks.map((t) => t._id);
    const reviews = await Review.find({ job: { $in: taskIds } }).lean();

    const reviewMap = {};
    reviews.forEach((r) => {
      reviewMap[r.job.toString()] = r;
    });

    const tasksWithReviews = tasks.map((task) => ({
      ...task,
      review: reviewMap[task._id.toString()] || null,
    }));

    res.status(200).json(tasksWithReviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

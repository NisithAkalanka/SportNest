const Review = require("../models/ReviewModel");

// --- For Members ---
exports.getMyReview = async (req, res) => {
  try {
    const review = await Review.findOne({ memberId: req.user._id });
    if (!review) {
      return res.status(200).json(null);
    }
    res.status(200).json(review);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching your review.", error: error.message });
  }
};

exports.createOrUpdateMyReview = async (req, res) => {
  const { rating, title, category, message } = req.body;
  try {
    if (!rating || !title || !category || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const reviewData = {
      memberId: req.user._id,
      rating,
      title,
      category,
      message,
    };
    const review = await Review.findOneAndUpdate(
      { memberId: req.user._id },
      reviewData,
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json({ message: "Your review has been saved!", review });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error saving your review.", error: error.message });
  }
};

exports.deleteMyReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ memberId: req.user._id });
    if (!review) {
      return res
        .status(404)
        .json({ message: "You don't have a review to delete." });
    }
    res.status(200).json({ message: "Your review has been deleted." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting your review.", error: error.message });
  }
};

// --- For Public & Admins ---
exports.getFeaturedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isFeatured: true })
      .populate("memberId", "firstName lastName")
      .sort({ updatedAt: -1 })
      .limit(3);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching featured reviews.",
      error: error.message,
    });
  }
};

exports.getAllReviewsForAdmin = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate("memberId", "firstName lastName email")
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching all reviews.", error: error.message });
  }
};

exports.toggleFeaturedStatus = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }
    review.isFeatured = !review.isFeatured;
    await review.save();
    res
      .status(200)
      .json({ message: "Review feature status updated.", review });
  } catch (error) {
    res.status(500).json({
      message: "Error updating review status.",
      error: error.message,
    });
  }
};

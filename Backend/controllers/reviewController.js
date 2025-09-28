const Review = require("../models/ReviewModel");
const mongoose = require('mongoose');

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
    // Support both flags: isFeatured / featured
    const filter = { $or: [{ isFeatured: true }, { featured: true }] };

    // Build query and conditionally populate based on schema
    let q = Review.find(filter).sort({ updatedAt: -1, createdAt: -1 }).limit(6);

    if (Review.schema.path('memberId')) {
      q = q.populate({ path: 'memberId', select: 'firstName lastName role profileImage clubId' });
    } else if (Review.schema.path('member')) {
      q = q.populate({ path: 'member', select: 'firstName lastName role profileImage clubId' });
    }

    const docs = await q.lean();

    // Map into a simple shape expected by the Home page widget
    const items = docs.map((r) => {
      const person = r.memberId || r.member || {};
      const name = (person.firstName || person.lastName)
        ? `${person.firstName || ''} ${person.lastName || ''}`.trim()
        : (r.title || 'Member');
      const role = person.role || r.category || 'Member';
      const avatar = person.profileImage || '/uploads/default-avatar.png';
      const message = r.message || r.comment || r.text || '';
      const rating = r.rating ?? r.stars ?? 5;
      return { id: r._id, name, role, avatar, message, rating };
    });

    return res.status(200).json(items);
  } catch (error) {
    console.error('getFeaturedReviews error:', error);
    return res.status(500).json({ message: 'Error fetching featured reviews.' });
  }
};

exports.getAllReviewsForAdmin = async (req, res) => {
  try {
    let q = Review.find({}).sort({ createdAt: -1 });

    if (Review.schema.path('memberId')) {
      q = q.populate('memberId', 'firstName lastName email');
    } else if (Review.schema.path('member')) {
      q = q.populate('member', 'firstName lastName email');
    }

    const reviews = await q;
    res.status(200).json(reviews);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching all reviews.', error: error.message });
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

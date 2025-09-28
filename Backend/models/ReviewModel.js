const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
      unique: true, // eka member kenekta eka review ekak witharai karanna denne.
    },
    rating: {
      type: Number,
      required: [true, "Rating is required."],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: [true, "Review title is required."],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters."],
    },
    category: {
      type: String,
      required: [true, "Category is required."],
      enum: [
        "Coaching",
        "Club Facilities",
        "Customer Service",
        "Events",
        "Overall Experience",
      ],
    },
    message: {
      type: String,
      required: [true, "Review message is required."],
      trim: true,
      maxlength: [1500, "Message cannot exceed 1500 characters."],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;

const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true }, // receiver
    coach:  { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true }, // sender
    rating: { type: Number, min: 1, max: 5, required: true },
    comment:{ type: String, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);

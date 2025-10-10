// File: backend/controllers/feedbackController.js (MERGED FINAL VERSION)
//yoma

const Feedback = require("../models/FeedbackModel");
const Player = require("../models/PlayerModel");
const Member = require("../models/memberModel");
const sendEmail = require("../utils/email");
const mongoose = require('mongoose');

// Helper function
const assertCoach = (user) => {
  if (!user || (user.role || '').toLowerCase() !== 'coach') {
    const err = new Error("Only coaches can perform this action");
    err.statusCode = 403;
    throw err;
  }
};

// ======================= CREATE FEEDBACK =======================
const createCoachFeedback = async (req, res) => {
  try {
    // 1️⃣ Authorize
    assertCoach(req.user);

    // 2️⃣ Extract data
    const { playerId: memberId, rating, comment } = req.body;

    // 3️⃣ Find the Player Profile using the Member ID
    const player = await Player.findOne({ member: memberId }).populate("member", "firstName lastName email");

    if (!player || !player.member) {
      return res.status(404).json({ message: "Player or associated member data not found." });
    }

    // 4️⃣ Find coach details
    const coach = await Member.findById(req.user.id).select("firstName lastName");
    if (!coach) {
      return res.status(404).json({ message: "Coach not found" });
    }

    // 5️⃣ Create feedback document
    const newFeedback = await Feedback.create({
      player: player._id,
      coach: coach._id,
      rating,
      comment: comment || ""
    });

    // 6️⃣ Populate for response
    const populatedFeedback = await Feedback.findById(newFeedback._id)
      .populate("coach", "firstName lastName")
      .populate({
        path: "player",
        populate: { path: "member", select: "firstName lastName clubId" }
      });

    // 7️⃣ Email notification
    const to = player.member.email;
    if (to) {
      const playerName = `${player.member.firstName || ''}`.trim();
      const coachName = `${coach.firstName || ''} ${coach.lastName || ''}`.trim();
      const subject = `New Feedback from Your Coach, ${coachName}!`;

      // ✅ Complete HTML body (from your original version)
      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #059669;">Hello ${playerName},</h2>
          <p>You have received new feedback from your coach, <strong>${coachName}</strong> regarding your performance.</p>
          <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-top: 20px;">
            <p style="margin: 0 0 10px 0;"><strong>Rating:</strong> 
              <span style="color: #ffc107; font-size: 1.2em;">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</span> 
              (${rating} out of 5)
            </p>
            <p style="margin: 0;"><strong>Coach's Comment:</strong></p>
            <blockquote style="margin: 10px 0; padding: 10px 15px; background-color: #fff; border-left: 4px solid #059669; font-style: italic;">
              ${comment || 'No specific comment was provided.'}
            </blockquote>
          </div>
          <p style="margin-top: 25px;">Every feedback is a step forward in your sports career. Don't give up!</p>
           <p style="margin-top: 25px;"> If you need more information about this feedback, talk to your coach.</p>
          <p>Thank you,<br/>The SportNest Team</p>
        </div>
      `;

      try {
        await sendEmail({ to, subject, html });
      } catch (emailError) {
        console.error(`Email to ${to} FAILED:`, emailError.message);
        return res.status(500).json({
          message: 'Feedback was saved, but the notification email could not be sent. Please check server logs.'
        });
      }
    }

    // 8️⃣ Send success response
    res.status(201).json(populatedFeedback);

  } catch (e) {
    console.error("CREATE FEEDBACK FAILED:", e);
    res.status(e.statusCode || 500).json({ message: e.message || "Failed to create feedback" });
  }
};

// ======================= GET FEEDBACKS =======================
const getCoachFeedbacks = async (req, res) => {
  try {
    assertCoach(req.user);
    const list = await Feedback.find({ coach: req.user.id })
      .sort({ createdAt: -1 })
      .populate("coach", "firstName lastName")
      .populate({
        path: "player",
        populate: { path: "member", select: "firstName lastName clubId" }
      });
    res.json(list);
  } catch (e) {
    console.error("GET COACH FEEDBACKS FAILED:", e);
    res.status(e.statusCode || 500).json({ message: e.message || "Failed to load feedbacks" });
  }
};

// ======================= UPDATE FEEDBACK =======================
const updateFeedback = async (req, res) => {
  try {
    assertCoach(req.user);
    const { id } = req.params;
    const { rating, comment } = req.body;
    const fb = await Feedback.findById(id);

    if (!fb) return res.status(404).json({ message: "Feedback not found" });
    if (String(fb.coach) !== String(req.user.id)) return res.status(403).json({ message: "Forbidden" });

    if (rating !== undefined) fb.rating = rating;
    if (comment !== undefined) fb.comment = comment;
    await fb.save();

    const populated = await Feedback.findById(id)
      .populate("coach", "firstName lastName")
      .populate({
        path: "player",
        populate: { path: "member", select: "firstName lastName clubId" }
      });
    res.json(populated);
  } catch (e) {
    console.error("UPDATE FEEDBACK FAILED:", e);
    res.status(e.statusCode || 500).json({ message: e.message || "Failed to update feedback" });
  }
};

// ======================= DELETE FEEDBACK =======================
const deleteFeedback = async (req, res) => {
  try {
    assertCoach(req.user);
    const fb = await Feedback.findById(req.params.id);
    if (!fb) return res.status(404).json({ message: "Feedback not found" });
    if (String(fb.coach) !== String(req.user.id)) return res.status(403).json({ message: "Forbidden" });
    await fb.deleteOne();
    res.json({ message: "Deleted" });
  } catch (e) {
    console.error("DELETE FEEDBACK FAILED:", e);
    res.status(e.statusCode || 500).json({ message: e.message || "Failed to delete" });
  }
};

// ======================= FEEDBACK SUMMARY =======================
const getFeedbackSummary = async (req, res) => {
  try {
    assertCoach(req.user);
    const coachId = new mongoose.Types.ObjectId(req.user.id);

    const stats = await Feedback.aggregate([
      { $match: { coach: coachId } },
      {
        $group: {
          _id: null,
          totalFeedbacks: { $sum: 1 },
          averageRating: { $avg: "$rating" }
        }
      }
    ]);

    const ratingDistribution = await Feedback.aggregate([
      { $match: { coach: coachId } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const chartData = [1, 2, 3, 4, 5].map(star => {
      const found = ratingDistribution.find(item => item._id === star);
      return { rating: `${star} Star`, count: found ? found.count : 0 };
    });

    const summary = {
      totalFeedbacks: stats.length > 0 ? stats[0].totalFeedbacks : 0,
      averageRating: stats.length > 0 ? stats[0].averageRating.toFixed(1) : "N/A",
      chartData: chartData
    };

    res.status(200).json({ success: true, data: summary });
  } catch (e) {
    console.error("getFeedbackSummary Error:", e);
    res.status(e.statusCode || 500).json({ message: e.message || "Failed to load summary" });
  }
};

// ======================= EXPORTS =======================
module.exports = {
  createCoachFeedback,
  getCoachFeedbacks,
  updateFeedback,
  deleteFeedback,
  getFeedbackSummary
};

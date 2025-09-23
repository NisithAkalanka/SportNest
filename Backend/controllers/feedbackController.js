// File: backend/controllers/feedbackController.js (FINAL, STABLE & 100% COMPLETE)

const Feedback = require("../models/FeedbackModel");
const Player = require("../models/PlayerModel");
const Member = require("../models/memberModel");
const sendEmail = require("../utils/email");
const mongoose = require('mongoose');

// Helper function to check if the user is a coach
const assertCoach = (user) => {
  if (!user || (user.role || '').toLowerCase() !== 'coach') {
    const err = new Error("Only coaches can perform this action");
    err.statusCode = 403;
    throw err;
  }
};

// --- We define all functions as regular constants first ---

const createCoachFeedback = async (req, res) => {
  try {
    assertCoach(req.user);
    const { playerId, rating, comment } = req.body;

    const player = await Player.findById(playerId).populate("member", "firstName lastName email");
    if (!player || !player.member) {
      return res.status(404).json({ message: "Player or associated member data not found." });
    }

    const coach = await Member.findById(req.user.id).select("firstName lastName");
    if (!coach) {
      return res.status(404).json({ message: "Coach not found" });
    }

    const newFeedback = await Feedback.create({
      player: player._id,
      coach: coach._id,
      rating,
      comment: comment || ""
    });

    const populatedFeedback = await Feedback.findById(newFeedback._id)
      .populate("coach", "firstName lastName")
      .populate({ path: "player", populate: { path: "member", select: "firstName lastName clubId" } });

    // Email logic
    const to = player.member.email;
    if (to) {
      const playerName = `${player.member.firstName} ${player.member.lastName}`;
      const coachName  = `${coach.firstName} ${coach.lastName}`;
      const subject = `New Feedback from Your Coach, ${coachName}!`;
      const html = `
        <div style="font-family: Arial, sans-serif;">
          <h2>Hello ${playerName},</h2>
          <p>You received new feedback from <b>${coachName}</b>.</p>
          <p><b>Rating:</b> ${rating}/5 stars</p>
          <p><b>Comment:</b> ${comment || 'No comment provided.'}</p>
        </div>`;
      
      try {
        await sendEmail({ to, subject, html });
      } catch (emailError) {
          console.error(`Email to ${to} FAILED:`, emailError.message);
          return res.status(500).json({ 
            message: 'Feedback was saved, but the notification email could not be sent. Please check server logs.'
          });
      }
    }

    res.status(201).json(populatedFeedback);

  } catch (e) {
    console.error("CREATE FEEDBACK FAILED:", e);
    res.status(e.statusCode || 500).json({ message: e.message || "Failed to create feedback" });
  }
};

const getCoachFeedbacks = async (req, res) => {
  try {
    assertCoach(req.user);
    const list = await Feedback.find({ coach: req.user.id })
      .sort({ createdAt: -1 })
      .populate("coach", "firstName lastName")
      .populate({ path: "player", populate: { path: "member", select: "firstName lastName clubId" } });
    res.json(list);
  } catch (e) {
    console.error("GET COACH FEEDBACKS FAILED:", e);
    res.status(e.statusCode || 500).json({ message: e.message || "Failed to load feedbacks" });
  }
};

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
      .populate({ path: "player", populate: { path: "member", select: "firstName lastName clubId" } });
    res.json(populated);
  } catch (e) {
    console.error("UPDATE FEEDBACK FAILED:", e);
    res.status(e.statusCode || 500).json({ message: e.message || "Failed to update feedback" });
  }
};

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

const getFeedbackSummary = async (req, res) => {
  try {
    assertCoach(req.user);
    const coachId = new mongoose.Types.ObjectId(req.user.id);
    
    const stats = await Feedback.aggregate([
      { $match: { coach: coachId } },
      { $group: { _id: null, totalFeedbacks: { $sum: 1 }, averageRating: { $avg: "$rating" } } }
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

// --- Now, we export all the constants we defined in a single, clean object ---
module.exports = {
  createCoachFeedback,
  getCoachFeedbacks,
  updateFeedback,
  deleteFeedback,
  getFeedbackSummary
};
// File: backend/controllers/feedbackController.js (CORRECTED VERSION)

const Feedback = require("../models/FeedbackModel");
const Player = require("../models/PlayerModel");
const Member = require("../models/memberModel");
const sendEmail = require("../utils/email");
const mongoose = require('mongoose');

// Helper function (no changes)
const assertCoach = (user) => {
  if (!user || (user.role || '').toLowerCase() !== 'coach') {
    const err = new Error("Only coaches can perform this action");
    err.statusCode = 403;
    throw err;
  }
};



const createCoachFeedback = async (req, res) => {
  try {
    // 1. Authorize the user (no change)
    assertCoach(req.user);
    
    // 2. Get data from request body. 
    // We are renaming 'playerId' to 'memberId' for clarity, as the frontend is now sending the Member's ID.
    const { playerId: memberId, rating, comment } = req.body;

    
    // 3. Find the Player Profile. Instead of finding by the Player's ID directly,
    //    we now find ONE player profile where the 'member' field matches the memberId we received.
    const player = await Player.findOne({ member: memberId }).populate("member", "firstName lastName email");

    // 4. Validate if a player profile and associated member was found (no change)
    if (!player || !player.member) {
      return res.status(404).json({ message: "Player or associated member data not found." });
    }

    // 5. Find the coach's details (no change)
    const coach = await Member.findById(req.user.id).select("firstName lastName");
    if (!coach) {
      return res.status(404).json({ message: "Coach not found" });
    }

    // 6. Create the feedback document. Note that we use `player._id` here, which is the actual ID of the Player Profile document.
    const newFeedback = await Feedback.create({
      player: player._id, // This is now correct
      coach: coach._id,
      rating,
      comment: comment || ""
    });

    const populatedFeedback = await Feedback.findById(newFeedback._id)
      .populate("coach", "firstName lastName")
      .populate({ path: "player", populate: { path: "member", select: "firstName lastName clubId" } });

    // 7. Send the notification email (no change)
    const to = player.member.email;
    if (to) {
      const playerName = `${player.member.firstName} ${player.member.lastName}`;
      const coachName  = `${coach.firstName} ${coach.lastName}`;
      const subject = `New Feedback from Your Coach, ${coachName}!`;
      const html = `...`; // Email HTML is the same
      
      try {
        await sendEmail({ to, subject, html });
      } catch (emailError) {
          console.error(`Email to ${to} FAILED:`, emailError.message);
          return res.status(500).json({ 
            message: 'Feedback was saved, but the notification email could not be sent. Please check server logs.'
          });
      }
    }

    // 8. Send the final success response (no change)
    res.status(201).json(populatedFeedback);

  } catch (e) {
    console.error("CREATE FEEDBACK FAILED:", e);
    res.status(e.statusCode || 500).json({ message: e.message || "Failed to create feedback" });
  }
};



// --- Other functions in this file have no changes ---

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
  // ... no changes in this function ...
  try {
    assertCoach(req.user);
    const coachId = new mongoose.Types.ObjectId(req.user.id);
    const stats = await Feedback.aggregate([ { $match: { coach: coachId } }, { $group: { _id: null, totalFeedbacks: { $sum: 1 }, averageRating: { $avg: "$rating" } } } ]);
    const ratingDistribution = await Feedback.aggregate([ { $match: { coach: coachId } }, { $group: { _id: "$rating", count: { $sum: 1 } } }, { $sort: { _id: 1 } } ]);
    const chartData = [1, 2, 3, 4, 5].map(star => { const found = ratingDistribution.find(item => item._id === star); return { rating: `${star} Star`, count: found ? found.count : 0 }; });
    const summary = { totalFeedbacks: stats.length > 0 ? stats[0].totalFeedbacks : 0, averageRating: stats.length > 0 ? stats[0].averageRating.toFixed(1) : "N/A", chartData: chartData };
    res.status(200).json({ success: true, data: summary });
  } catch (e) { console.error("getFeedbackSummary Error:", e); res.status(e.statusCode || 500).json({ message: e.message || "Failed to load summary" }); }
};


module.exports = {
  createCoachFeedback,
  getCoachFeedbacks,
  updateFeedback,
  deleteFeedback,
  getFeedbackSummary
};
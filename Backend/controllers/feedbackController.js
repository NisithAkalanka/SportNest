// File: backend/controllers/feedbackController.js (FINAL & CORRECTED)

const Feedback = require("../models/FeedbackModel");
const Player   = require("../models/PlayerModel");
const Member   = require("../models/memberModel");
const sendEmail = require("../utils/email");

const assertCoach = (user) => {
  if (!user || (user.role || '').toLowerCase() !== "coach") {
    const err = new Error("Only coaches can perform this action");
    err.statusCode = 403;
    throw err;
  }
};

// CREATE FEEDBACK
exports.createCoachFeedback = async (req, res) => {
  try {
    assertCoach(req.user);
    const { playerId, rating, comment } = req.body;

    const player = await Player.findById(playerId).populate("member", "firstName lastName email");
    if (!player || !player.member) {
      return res.status(404).json({ message: "Player or associated member data not found." });
    }

    const coach = await Member.findById(req.user.id).select("firstName lastName");
    if (!coach) return res.status(404).json({ message: "Coach not found" });

    // 1. Create feedback first. If this fails, the process stops.
    const newFeedback = await Feedback.create({
      player: player._id,
      coach: coach._id,
      rating,
      comment: comment || ""
    });

    // 2. ★★★ EMAIL LOGIC IS NOW ACTIVE AND HAS ERROR HANDLING ★★★
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
        console.log(`Email successfully sent to ${to}`);
      } catch (emailError) {
          // IMPORTANT: If email fails, we now stop and send back an error.
          console.error(`Email to ${to} FAILED:`, emailError.message);
          // We let the frontend know that feedback was saved but email failed.
          return res.status(500).json({ 
            message: 'Feedback was saved, but the notification email could not be sent. Please check server logs.'
          });
      }
    } else {
        console.warn(`No email address found for player ${player.member.firstName}. Skipping notification.`);
    }
    
    // 3. Re-fetch the created feedback to populate it correctly for the response
    const populatedFeedback = await Feedback.findById(newFeedback._id)
      .populate("coach", "firstName lastName")
      .populate({ path: "player", populate: { path: "member", select: "firstName lastName clubId" } });

    res.status(201).json(populatedFeedback);

  } catch (e) {
    // This will catch errors from assertCoach or Feedback.create
    console.error("createCoachFeedback general error:", e);
    res.status(e.statusCode || 500).json({ message: e.message || "Failed to create feedback" });
  }
};


// (No changes are needed for the functions below, but they are included for completeness)

// READ ALL FEEDBACKS FOR THE LOGGED-IN COACH
exports.getCoachFeedbacks = async (req, res) => {
  try {
    assertCoach(req.user);
    const list = await Feedback.find({ coach: req.user.id })
      .sort({ createdAt: -1 })
      .populate("coach", "firstName lastName")
      .populate({ path: "player", populate: { path: "member", select: "firstName lastName clubId" } });
    res.json(list);
  } catch (e) {
    console.error("getCoachFeedbacks Error:", e);
    res.status(e.statusCode || 500).json({ message: e.message || "Failed to load feedbacks" });
  }
};

// UPDATE A SPECIFIC FEEDBACK
exports.updateFeedback = async (req, res) => {
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
    console.error("updateFeedback Error:", e);
    res.status(e.statusCode || 500).json({ message: e.message || "Failed to update feedback" });
  }
};

// DELETE A SPECIFIC FEEDBACK
exports.deleteFeedback = async (req, res) => {
  try {
    assertCoach(req.user);
    const fb = await Feedback.findById(req.params.id);
    if (!fb) return res.status(404).json({ message: "Feedback not found" });
    if (String(fb.coach) !== String(req.user.id)) return res.status(403).json({ message: "Forbidden" });
    await fb.deleteOne();
    res.json({ message: "Deleted" });
  } catch (e) {
    console.error("deleteFeedback Error:", e);
    res.status(e.statusCode || 500).json({ message: e.message || "Failed to delete" });
  }
};
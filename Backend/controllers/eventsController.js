const Event = require("../models/Event");
// ඔබේ project එකේ තියෙන email.js ගොනුව නිවැරදි path එකෙන් import කරගන්න
const sendEmail = require('../utils/email'); // වැදගත්: මෙම path එක ඔබේ project එකට ගැලපෙන ලෙස වෙනස් කරන්න.

// small helper
const sameId = (a, b) => a && b && String(a) === String(b);

// pending events
exports.submitEvent = async (req, res, next) => {
  try {
    const ev = await Event.create({
      name: req.body.name,
      description: req.body.description,
      venue: req.body.venue,
      venueFacilities: req.body.venueFacilities || [],
      requestedItems: req.body.requestedItems || [],
      capacity: req.body.capacity,
      date: req.body.date,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      registrationFee: req.body.registrationFee,
      submittedBy: req.user?.id, // if auth is present
      status: "pending",
    });
    res.status(201).json(ev);
  } catch (err) { next(err); }
};

// admin list
exports.listEvents = async (req, res, next) => {
  try {
    const { status, q } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (q) filter.name = { $regex: q, $options: "i" };
    const data = await Event.find(filter).sort({ date: 1, startTime: 1 });
    res.json(data);
  } catch (err) { next(err); }
};

// events created logged-in member
exports.listMine = async (req, res, next) => {
  try {
    const uid = req.user?.id;
    if (!uid) return res.status(401).json({ error: "Login required" });
    const data = await Event.find({ submittedBy: uid }).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) { next(err); }
};

// public list
exports.listApproved = async (req, res, next) => {
  try {
    const { q } = req.query;
    const filter = { status: "approved" };
    if (q) filter.name = { $regex: q, $options: "i" };
    const data = await Event.find(filter).sort({ date: 1, startTime: 1 });
    res.json(data);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.sendStatus(404);
    res.json(ev);
  } catch (err) { next(err); }
};


// approve events (admin) - Email Feature Added
exports.approve = async (req, res, next) => {
  try {
    // Member's details (email, name) get करने के लिए `.populate()` का उपयोग करें
    const ev = await Event.findById(req.params.id).populate("submittedBy", "email name");
    if (!ev) return res.sendStatus(404);

    ev.status = "approved";
    ev.approvedBy = req.user?.id;
    await ev.save({ validateBeforeSave: false }); // validation skip to prevent errors on old events
    
    // Send email to the submitter
    if (ev.submittedBy && ev.submittedBy.email) {
      const subject = `Your Event "${ev.name}" has been Approved!`;
      const htmlBody = `
        <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
          <h2 style="color: #22c55e;">Great News! Your Event is Approved!</h2>
          <p>Hello ${ev.submittedBy.name || 'Member'},</p>
          <p>Your event submission, <strong>"${ev.name}"</strong>, has been reviewed and approved by the admin.</p>
          <p>It is now visible to the public on the Events page.</p>
          <p>Thank you for contributing to SportNest!</p>
          <br>
          <p>Best regards,</p>
          <p><strong>The SportNest Team</strong></p>
        </div>
      `;
      
      try {
        await sendEmail({
          to: ev.submittedBy.email,
          subject: subject,
          html: htmlBody,
        });
      } catch (emailError) {
        console.error("Email could not be sent (but event was approved):", emailError);
      }
    }
    
    res.json(ev);
  } catch (err) { next(err); }
};


// reject events (admin) - Email Feature Added
exports.reject = async (req, res, next) => {
  try {
    // Member's details get کرنے کے لیے `.populate()` کا उपयोग करें
    const ev = await Event.findById(req.params.id).populate("submittedBy", "email name");
    if (!ev) return res.sendStatus(404);

    ev.status = "rejected";
    ev.approvedBy = req.user?.id;
    await ev.save({ validateBeforeSave: false });
    
    // Send email to the submitter
    if (ev.submittedBy && ev.submittedBy.email) {
      const subject = `Update on Your Event Submission: "${ev.name}"`;
      const htmlBody = `
        <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
          <h2 style="color: #ef4444;">Update on Your Event Submission</h2>
          <p>Hello ${ev.submittedBy.name || 'Member'},</p>
          <p>Thank you for submitting your event, <strong>"${ev.name}"</strong>.</p>
          <p>After review, we regret to inform you that your event submission has been rejected. This could be due to a scheduling conflict or missing information.</p>
          <p>You can delete this submission from your "My Events" page and create a new one if you wish.</p>
          <br>
          <p>Best regards,</p>
          <p><strong>The SportNest Team</strong></p>
        </div>
      `;
      
      try {
        await sendEmail({
          to: ev.submittedBy.email,
          subject: subject,
          html: htmlBody,
        });
      } catch (emailError) {
        console.error("Email could not be sent (but event was rejected):", emailError);
      }
    }
    
    res.json(ev);
  } catch (err) { next(err); }
};


exports.updateEvent = async (req, res, next) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.sendStatus(404);

    const userId = req.user?.id;
    const isAdmin = req.user?.role === "admin";
    const isSubmitter = userId && sameId(ev.submittedBy, userId);
    const submitterAllowed = isSubmitter && ev.status !== "approved";

    if (!isAdmin && !submitterAllowed) {
      return res.status(403).json({ error: "Not allowed to edit this event" });
    }

    const payload = { ...req.body };
    if (!isAdmin) {
      delete payload.status;
      delete payload.approvedBy;
      delete payload.submittedBy;
    }

    if (typeof payload.capacity === "number" && payload.capacity < ev.registrations.length) {
      return res.status(400).json({ error: `Capacity cannot be less than current registrations (${ev.registrations.length})` });
    }

    const updated = await Event.findByIdAndUpdate(ev._id, payload, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (err) { next(err); }
};


exports.deleteEvent = async (req, res, next) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.sendStatus(404);

    const userId = req.user?.id;
    const isAdmin = req.user?.role === "admin";
    const isSubmitter = userId && sameId(ev.submittedBy, userId);
    const submitterAllowed = isSubmitter && ev.status !== "approved";

    if (!isAdmin && !submitterAllowed) {
      return res.status(403).json({ error: "Not allowed to delete this event" });
    }

    await ev.deleteOne();
    res.sendStatus(204);
  } catch (err) { next(err); }
};

// register (public)
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.sendStatus(404);
    if (ev.status !== "approved") return res.status(400).json({ error: "Event not approved yet" });
    if (ev.isFull) return res.status(400).json({ error: "Event is full" });

    if (email && ev.registrations.some(r => r.email?.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: "Already registered with this email" });
    }

    ev.registrations.push({ name, email, phone });
    await ev.save();
    res.json({ message: "Registered", registeredCount: ev.registeredCount, capacity: ev.capacity });
  } catch (err) { next(err); }
};
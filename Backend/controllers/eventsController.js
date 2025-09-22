// Backend/controllers/eventsController.js
const Event = require("../models/Event");

// ───────────────── Helpers ─────────────────
const sameId = (a, b) => a && b && String(a) === String(b);
const trim = (v) => (typeof v === "string" ? v.trim() : v);
const toDate = (d) => (d ? new Date(d) : null);
const isValidDate = (d) => d instanceof Date && !isNaN(d.valueOf());
const MAX_CAPACITY = 500;

// ───────────────── Create (member/admin) -> pending ─────────────────
// POST /api/events/submit
exports.submitEvent = async (req, res, next) => {
  try {
    const {
      name = "",
      description = "",
      venue = "",
      venueFacilities = [],
      requestedItems = [],
      capacity,
      date,
      startTime = "",
      endTime = "",
    } = req.body || {};

    const _name = trim(name);
    const _desc = trim(description);
    const _venue = trim(venue);
    const _start = trim(startTime);
    const _end = trim(endTime);
    const _cap = Number(capacity || 0);
    const _date = toDate(date);

    const _fac = Array.isArray(venueFacilities)
      ? venueFacilities.map(trim).filter(Boolean)
      : [];

    const _reqItems = Array.isArray(requestedItems)
      ? requestedItems
          .map((r) => ({ item: trim(r?.item || ""), qty: Number(r?.qty || 0) }))
          .filter((r) => r.item && r.qty > 0)
      : [];

    // Validate
    const errors = [];
    if (!_name) errors.push("Event name is required");
    if (!_venue) errors.push("Venue is required");

    if (!_cap || _cap < 1) errors.push("Capacity must be at least 1");
    if (_cap > MAX_CAPACITY) errors.push(`Capacity must be ≤ ${MAX_CAPACITY}`);

    if (!_date || !isValidDate(_date)) errors.push("Date is invalid");
    else {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const max = new Date(today); max.setMonth(max.getMonth() + 3);
      if (_date < today) errors.push("Date cannot be in the past");
      if (_date > max) errors.push("Date must be within the next 3 months");
    }

    if (!_start || !_end) errors.push("Start and end time are required");
    if (_start && _end && _start >= _end)
      errors.push("Start time must be before end time");

    if (errors.length) {
      return res.status(400).json({ error: errors.join(" • ") });
    }

    // Create
    const ev = await Event.create({
      name: _name,
      description: _desc,
      venue: _venue,
      venueFacilities: _fac,
      requestedItems: _reqItems,
      capacity: _cap,
      date: _date,        // Date
      startTime: _start,  // "HH:mm"
      endTime: _end,
      submittedBy: req.user?.id || null,
      status: "pending",
      registrations: [],
    });

    res.status(201).json(ev);
  } catch (err) {
    if (err?.name === "ValidationError") {
      const msg = Object.values(err.errors).map(e => e.message).join(" • ");
      return res.status(400).json({ error: msg || "Validation failed" });
    }
    next(err);
  }
};

// ───────────────── Admin list with filters ─────────────────
// GET /api/events?status=&q=
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

// ───────────────── Member's own submissions ─────────────────
// GET /api/events/mine
exports.listMine = async (req, res, next) => {
  try {
    const uid = req.user?.id;
    if (!uid) return res.status(401).json({ error: "Login required" });
    const data = await Event.find({ submittedBy: uid }).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) { next(err); }
};

// ───────────────── Public approved list ─────────────────
// GET /api/events/approved
exports.listApproved = async (req, res, next) => {
  try {
    const { q } = req.query;
    const filter = { status: "approved" };
    if (q) filter.name = { $regex: q, $options: "i" };
    const data = await Event.find(filter).sort({ date: 1, startTime: 1 });
    res.json(data);
  } catch (err) { next(err); }
};

// ───────────────── Get by id (public) ─────────────────
// GET /api/events/:id
exports.getById = async (req, res, next) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.sendStatus(404);
    res.json(ev);
  } catch (err) { next(err); }
};

// ───────────────── Admin approve/reject ─────────────────
// PATCH /api/events/:id/approve
exports.approve = async (req, res, next) => {
  try {
    const ev = await Event.findByIdAndUpdate(
      req.params.id,
      { status: "approved", approvedBy: req.user?.id },
      { new: true }
    );
    if (!ev) return res.sendStatus(404);
    res.json(ev);
  } catch (err) { next(err); }
};

// PATCH /api/events/:id/reject
exports.reject = async (req, res, next) => {
  try {
    const ev = await Event.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", approvedBy: req.user?.id },
      { new: true }
    );
    if (!ev) return res.sendStatus(404);
    res.json(ev);
  } catch (err) { next(err); }
};

// ───────────────── Update (admin always; submitter if not approved) ─────────────────
// PUT /api/events/:id
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

    // normalize & guard
    if (typeof payload.capacity !== "undefined") {
      payload.capacity = Number(payload.capacity);
      if (
        Number.isNaN(payload.capacity) ||
        payload.capacity < ev.registrations.length
      ) {
        return res.status(400).json({
          error: `Capacity cannot be less than current registrations (${ev.registrations.length})`,
        });
      }
      if (payload.capacity > MAX_CAPACITY) {
        return res.status(400).json({ error: `Capacity must be ≤ ${MAX_CAPACITY}` });
      }
    }

    if (payload.date) {
      const d = toDate(payload.date);
      if (!isValidDate(d)) return res.status(400).json({ error: "Invalid date" });
      payload.date = d;
    }

    if (Array.isArray(payload.venueFacilities)) {
      payload.venueFacilities = payload.venueFacilities.map(trim).filter(Boolean);
    }
    if (Array.isArray(payload.requestedItems)) {
      payload.requestedItems = payload.requestedItems
        .map(r => ({ item: trim(r?.item || ""), qty: Number(r?.qty || 0) }))
        .filter(r => r.item && r.qty > 0);
    }

    // submitter cannot change workflow fields
    if (!isAdmin) {
      delete payload.status;
      delete payload.approvedBy;
      delete payload.submittedBy;
    }

    const updated = await Event.findByIdAndUpdate(ev._id, payload, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (err) { next(err); }
};

// ───────────────── Delete (admin always; submitter if not approved) ─────────────────
// DELETE /api/events/:id
exports.deleteEvent = async (req, res, next) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.sendStatus(404);

    const userId = req.user?.id;
    const isAdmin = req.user?.role === "admin"; // ✅ fixed (no stray "the")
    const isSubmitter = userId && sameId(ev.submittedBy, userId);
    const submitterAllowed = isSubmitter && ev.status !== "approved";

    if (!isAdmin && !submitterAllowed) {
      return res.status(403).json({ error: "Not allowed to delete this event" });
    }

    await ev.deleteOne();
    res.sendStatus(204);
  } catch (err) { next(err); }
};

// ───────────────── Public register ─────────────────
// POST /api/events/:id/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body || {};
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.sendStatus(404);

    if (ev.status !== "approved") {
      return res.status(400).json({ error: "Event not approved yet" });
    }

    // If schema has virtuals (isFull / registeredCount), these work nicely.
    if (ev.isFull) return res.status(400).json({ error: "Event is full" });

    if (
      email &&
      ev.registrations.some(r => r.email?.toLowerCase() === String(email).toLowerCase())
    ) {
      return res.status(400).json({ error: "Already registered with this email" });
    }

    ev.registrations.push({
      name: trim(name),
      email: trim(email),
      phone: trim(phone),
    });
    await ev.save();

    res.json({
      message: "Registered",
      registeredCount: ev.registeredCount,
      capacity: ev.capacity,
    });
  } catch (err) { next(err); }
};

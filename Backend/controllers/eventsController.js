const Event = require("../models/Event");

// small helper
const sameId = (a, b) => a && b && String(a) === String(b);

//pending events
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

// approve events (admin)
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

// reject events (admin)
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

    //  non-admins
    const payload = { ...req.body };
    if (!isAdmin) {
      delete payload.status;
      delete payload.approvedBy;
      delete payload.submittedBy;
    }

    // capacity cannot go below current registrations
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

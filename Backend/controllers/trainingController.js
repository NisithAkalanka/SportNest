const asyncHandler = require('express-async-handler');
const Training = require('../models/Training');

// new Training Session 
const createTrainingSession = asyncHandler(async (req, res) => {
  const { title, date, startTime, endTime, location, capacity } = req.body;

  if (!title || !date || !startTime || !endTime) {
    res.status(400);
    throw new Error('Please fill all required fields');
  }

  try {
    const training = await Training.create({
      title,
      date,
      startTime,
      endTime,
      location,
      capacity: capacity || 20, //  default 20
      coach: req.user.id,
    });
    res.status(201).json(training);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// All sessions
const getAllTrainings = asyncHandler(async (req, res) => {
  const sessions = await Training.find({})
    .populate('coach', 'firstName lastName')
    .populate('participants', 'firstName lastName');
  res.json(sessions);
});

//  Coach only sessions 
const getMySessions = asyncHandler(async (req, res) => {
  const sessions = await Training.find({ coach: req.user.id })
    .populate('participants', 'firstName lastName');
  res.json(sessions);
});

//  Session update
const updateSession = asyncHandler(async (req, res) => {
  const { title, date, startTime, endTime, location, capacity } = req.body;
  const session = await Training.findById(req.params.id);

  if (session && session.coach.toString() === req.user.id) {
    session.title = title || session.title;
    session.date = date || session.date;
    session.startTime = startTime || session.startTime;
    session.endTime = endTime || session.endTime;
    session.location = location || session.location;
    session.capacity = capacity || session.capacity;

    try {
      const updatedSession = await session.save();
      res.json(updatedSession);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  } else {
    res.status(404);
    throw new Error('Session not found or user not authorized');
  }
});

//  Session  delete 
const deleteSession = asyncHandler(async (req, res) => {
  const session = await Training.findById(req.params.id);

  if (session && session.coach.toString() === req.user.id) {
    await session.deleteOne();
    res.json({ message: 'Session removed' });
  } else {
    res.status(404);
    throw new Error('Session not found or user not authorized');
  }
});

//  Player register
const registerForTraining = asyncHandler(async (req, res) => {
  const session = await Training.findById(req.params.id);
  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }

  if (session.participants.includes(req.user.id)) {
    res.status(400);
    throw new Error('Already registered');
  }

  //  Capacity check
  if (session.participants.length >= session.capacity) {
    res.status(400);
    throw new Error('Session is full');
  }

  session.participants.push(req.user.id);
  await session.save();

  res.json({ message: 'Registered successfully', session });
});

//  Player unregister
const unregisterFromTraining = asyncHandler(async (req, res) => {
  const session = await Training.findById(req.params.id);
  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }

  session.participants = session.participants.filter(
    (p) => p.toString() !== req.user.id
  );
  await session.save();

  res.json({ message: 'Unregistered successfully', session });
});

//  Coach summary (Dashboard cards)
const getCoachSummary = asyncHandler(async (req, res) => {
  const coachId = req.user.id;
  const sessions = await Training.find({ coach: coachId }).populate('participants');

  const total = sessions.length;
  const now = new Date();

  const upcoming = sessions.filter((s) => new Date(s.date) >= now).length;
  const completed = sessions.filter((s) => new Date(s.date) < now).length;

  // Avg attendance
  let avgAttendance = 0;
  if (sessions.length > 0) {
    const sum = sessions.reduce((acc, s) => {
      const cap = s.capacity || 0;
      const att = s.participants.length;
      const perc = cap > 0 ? (att / cap) * 100 : 0;
      return acc + perc;
    }, 0);
    avgAttendance = Math.round(sum / sessions.length);
  }

  // Attendance trend (last 5 sessions)
  const trend = sessions
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-5)
    .map((s) => {
      const cap = s.capacity || 0;
      const att = s.participants.length;
      const perc = cap > 0 ? Math.round((att / cap) * 100) : 0;
      return { date: s.date, attendance: perc };
    });

  res.json({ total, upcoming, completed, avgAttendance, trend });
});

module.exports = {
  createTrainingSession,
  getAllTrainings,
  getMySessions,
  updateSession,
  deleteSession,
  registerForTraining,
  unregisterFromTraining,
  getCoachSummary,
};

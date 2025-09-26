// Backend/server.js
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/db');

// Debug (optional): mask JWT secret length
const jwtSecret = process.env.JWT_SECRET || process.env.JWTSECRET || null;
if (!jwtSecret) {
  console.error('FATAL: JWT_SECRET not set in environment');
} else {
  const masked = jwtSecret.length > 6 ? `${jwtSecret.slice(0,3)}...${jwtSecret.slice(-3)}` : '***';
  console.log('JWT_SECRET loaded (masked):', masked);
}

const app = express();

// --- DB Connection ---
mongoose.set('strictQuery', false);
connectDB();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Static uploads ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const adminRoutes = require('./routes/adminRoutes');
const cartRoutes = require('./routes/cartRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const itemRoutes = require('./routes/itemRoutes');
const memberRoutes = require('./routes/memberRoutes');
const orderRoutes = require('./routes/orderRoutes');
const playerRoutes = require('./routes/playerRoutes');
const sponsorshipRoutes = require('./routes/sponsorshipRoutes');
const sportRoutes = require('./routes/sportRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const feedbackRoutes = require("./routes/feedbackRoutes");
const contactRoutes = require('./routes/contactRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const coachRoutes = require('./routes/coachRoutes');
const reviewRoutes = require("./routes/reviewRoutes");
const preorderRoutes = require('./routes/preorderRoutes');


const eventsRoutes        = require('./routes/eventsRoutes');         // general events API
const eventsReportRoutes  = require('./routes/eventsReportRoutes');   // reports only
const trainingRoutes = require('./routes/trainingRoutes');


// --- Mount order matters! ---
// Put the more specific /report routes BEFORE the generic /events routes.
app.use('/api/events/report', eventsReportRoutes);
app.use('/api/events',        eventsRoutes);

// Other APIs
app.use('/api/admin',        adminRoutes);
app.use('/api/cart',         cartRoutes);
app.use('/api/dashboard',    dashboardRoutes);
app.use('/api/items',        itemRoutes);
app.use('/api/members',      memberRoutes);
app.use('/api/orders',       orderRoutes);
app.use('/api/players',      playerRoutes);
app.use('/api/sponsorships', sponsorshipRoutes);
app.use('/api/sports', sportRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use("/api/feedbacks", feedbackRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/preorders', preorderRoutes);

app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/attendance', attendanceRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/coaches', coachRoutes);
app.use("/api/reviews", reviewRoutes);


// Backend/server.js
// ... අනෙකුත් routes ...
app.use('/api/sponsorships', require('./routes/sponsorshipRoutes'));
// Other middlewares...
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Health check ---
app.get('/', (req, res) => {
  res.send('API is running...');
});

// --- 404 fallback ---
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// --- Error handler ---
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 400).json({ error: err.message || 'Request failed' });
});

// --- Start server ---
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
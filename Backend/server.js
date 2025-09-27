// Backend/server.js (FINAL MERGED & CLEAN)

const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// DB & Scheduler
const connectDB = require('./config/db');
const startScheduledJobs = require('./utils/scheduler');

// Debug (optional): mask JWT secret length (from main2)
const jwtSecret = process.env.JWT_SECRET || process.env.JWTSECRET || null;
if (!jwtSecret) {
  console.error('FATAL: JWT_SECRET not set in environment');
} else {
  const masked =
    jwtSecret.length > 6
      ? `${jwtSecret.slice(0, 3)}...${jwtSecret.slice(-3)}`
      : '***';
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

// --- Route modules ---
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

const feedbackRoutes = require('./routes/feedbackRoutes');
const contactRoutes = require('./routes/contactRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const coachRoutes = require('./routes/coachRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const trainingRoutes = require('./routes/trainingRoutes');

const preorderRoutes = require('./routes/preorderRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const driverRoutes = require('./routes/driverRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const shippingRoutes = require('./routes/shippingRoutes');
const eventsRoutes = require('./routes/eventsRoutes'); // general events API
const eventsReportRoutes = require('./routes/eventsReportRoutes'); // reports only
const eventPaymentRoutes = require('./routes/eventPaymentRoutes');
const paymentMethodRoutes = require('./routes/paymentMethodRoutes');

// --- Mount order matters! ---
app.use('/api/events/report', eventsReportRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/events', eventPaymentRoutes);
app.use('/api/payments', paymentMethodRoutes);

// Other APIs
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/sponsorships', sponsorshipRoutes);
app.use('/api/sports', sportRoutes);
app.use('/api/suppliers', supplierRoutes);

app.use('/api/attendance', attendanceRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/trainings', trainingRoutes);

app.use('/api/preorders', preorderRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/shipping', shippingRoutes);

// --- Health check ---
app.get('/', (req, res) => {
  res.send('✅ API is running...');
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

// --- Start server with port fallback ---
const PORT = process.env.PORT || 5002;

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  try {
    if (typeof startScheduledJobs === 'function') startScheduledJobs();
  } catch (e) {
    console.warn('Scheduler failed to start:', e.message);
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Trying a free port...`);
    const fallback = app.listen(0, () => {
      const newPort = fallback.address().port;
      console.log(`✅ Server running on fallback port ${newPort}`);
      try {
        if (typeof startScheduledJobs === 'function') startScheduledJobs();
      } catch (e) {
        console.warn('Scheduler failed to start (fallback):', e.message);
      }
    });
  } else {
    throw err;
  }
});

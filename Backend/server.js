// Backend/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5002;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- DB Connection ---
mongoose.set('strictQuery', false);
const connectDB = require('./config/db');
connectDB();

// --- Route modules ---
const adminRoutes         = require('./routes/adminRoutes');
const cartRoutes          = require('./routes/cartRoutes');
const dashboardRoutes     = require('./routes/dashboardRoutes');
const itemRoutes          = require('./routes/itemRoutes');
const memberRoutes        = require('./routes/memberRoutes');
const orderRoutes         = require('./routes/orderRoutes');
const playerRoutes        = require('./routes/playerRoutes');
const sponsorshipRoutes   = require('./routes/sponsorshipRoutes');
const sportRoutes         = require('./routes/sportRoutes');
const supplierRoutes      = require('./routes/supplierRoutes');

const eventsRoutes        = require('./routes/eventsRoutes');         // general events API
const eventsReportRoutes  = require('./routes/eventsReportRoutes');   // reports only

// --- Mount order matters! ---
// Put the more specific /report routes BEFORE the generic /events routes.
app.use('/api/events/report', eventsReportRoutes);
app.use('/api/events',        eventsRoutes);

// Other APIs
app.use('/api/admin',       adminRoutes);
app.use('/api/cart',        cartRoutes);
app.use('/api/dashboard',   dashboardRoutes);
app.use('/api/items',       itemRoutes);
app.use('/api/members',     memberRoutes);
app.use('/api/orders',      orderRoutes);
app.use('/api/players',     playerRoutes);
app.use('/api/sponsorships',sponsorshipRoutes);
app.use('/api/sports',      sportRoutes);
app.use('/api/suppliers',   supplierRoutes);

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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

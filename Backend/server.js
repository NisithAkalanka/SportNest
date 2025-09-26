<<<<<<< Updated upstream
=======

// Backend/server.js
const path = require('path');
>>>>>>> Stashed changes
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());

//mongoose.connect(process.env.MONGO_URI);
// DB Connection
const connectDB = require('./config/db');
connectDB();

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

<<<<<<< Updated upstream
// Use routes
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/players', playerRoutes);
=======
const preorderRoutes = require('./routes/preorderRoutes');   // ✅
app.use('/api/preorders', preorderRoutes);   

const eventsRoutes        = require('./routes/eventsRoutes');         // general events API
const eventsReportRoutes  = require('./routes/eventsReportRoutes');   // reports only
const trainingRoutes = require('./routes/trainingRoutes');

const trainingRoutes = require('./routes/trainingRoutes');
app.use('/api/trainings', trainingRoutes);


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
>>>>>>> Stashed changes
app.use('/api/sponsorships', sponsorshipRoutes);
app.use('/api/sports', sportRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/suppliers', require('./routes/supplierRoutes'));
// Backend/server.js
// ... අනෙකුත් routes ...
app.use('/api/sponsorships', require('./routes/sponsorshipRoutes'));

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);//original
});


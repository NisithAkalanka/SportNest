const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

// Debug (optional): mask JWT secret length
const jwtSecret = process.env.JWT_SECRET || process.env.JWTSECRET || null;
if (!jwtSecret) {
  console.error('FATAL: JWT_SECRET not set in environment');
} else {
  const masked = jwtSecret.length > 6 ? `${jwtSecret.slice(0,3)}...${jwtSecret.slice(-3)}` : '***';
  console.log('JWT_SECRET loaded (masked):', masked);
}

const app = express();

// DB Connection
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Static uploads
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
const preorderRoutes = require('./routes/preorderRoutes');

// Use Routes
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
app.use('/api/preorders', preorderRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
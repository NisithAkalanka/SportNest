// Backend/server.js

/*const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// Scheduler Import
const startScheduledJobs = require("./utils/scheduler");

const app = express();
const PORT = process.env.PORT || 5002;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- DB Connection ---
const connectDB = require("./config/db");
connectDB();

<<<<<<< Updated upstream
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

// Use routes
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
app.use('/api/suppliers', require('./routes/supplierRoutes'));
// Backend/server.js
// ... අනෙකුත් routes ...
app.use('/api/sponsorships', require('./routes/sponsorshipRoutes'));
// Other middlewares...
=======
// --- Routes ---
const adminRoutes = require("./routes/adminRoutes");
const cartRoutes = require("./routes/cartRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const itemRoutes = require("./routes/itemRoutes");
const memberRoutes = require("./routes/memberRoutes");
const orderRoutes = require("./routes/orderRoutes");
const playerRoutes = require("./routes/playerRoutes");
const sponsorshipRoutes = require("./routes/sponsorshipRoutes");
const sportRoutes = require("./routes/sportRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const contactRoutes = require("./routes/contactRoutes");
const renewalRoutes = require("./routes/renewalRoutes");

// --- Use Routes ---
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/sponsorships", sponsorshipRoutes);
app.use("/api/sports", sportRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/renewals", renewalRoutes);

// --- Static Uploads ---
>>>>>>> Stashed changes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Root Test Route ---
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  startScheduledJobs();
});*/
// Backend/server.js

const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// MongoDB & Scheduler Imports
const connectDB = require("./config/db");
const startScheduledJobs = require("./utils/scheduler");

const app = express();
const PORT = process.env.PORT || 5002;

// ─── Middleware ─────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Connect Database ───────────────────────
connectDB();

// ─── Import Routes ──────────────────────────
const adminRoutes = require("./routes/adminRoutes");
const cartRoutes = require("./routes/cartRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const itemRoutes = require("./routes/itemRoutes");
const memberRoutes = require("./routes/memberRoutes");
const orderRoutes = require("./routes/orderRoutes");
const playerRoutes = require("./routes/playerRoutes");
const sponsorshipRoutes = require("./routes/sponsorshipRoutes");
const sportRoutes = require("./routes/sportRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const contactRoutes = require("./routes/contactRoutes");
const renewalRoutes = require("./routes/renewalRoutes");

// ─── Use Routes ─────────────────────────────
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/sponsorships", sponsorshipRoutes);
app.use("/api/sports", sportRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/renewals", renewalRoutes);

// ─── Static Uploads ─────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Root Test Route ────────────────────────
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

// ─── Start Server ───────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  startScheduledJobs();
});


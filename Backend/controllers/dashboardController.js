// Backend/controllers/dashboardController.js

const Order = require('../models/Order');
const Item = require('../models/Item');
const Supplier = require('../models/Supplier');
const Member = require('../models/memberModel');
const Player = require('../models/PlayerModel');

// --- 1. Membership statistics ---
const getMembershipStats = async (req, res) => {
  try {
    const totalMembers = await Member.countDocuments();

    // Assuming membership field indicates active membership
    const activeMembers = await Member.countDocuments({ membership: { $ne: null } });
    const noMembership = totalMembers - activeMembers;

    res.status(200).json({
      totalMembers,
      activeMembers,
      noMembership
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching membership stats' });
  }
};

// --- 2. Player statistics ---
const getPlayerStats = async (req, res) => {
  try {
    const totalPlayers = await Player.countDocuments();

    const playersBySport = await Player.aggregate([
      {
        $group: {
          _id: '$sport',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          sport: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      totalPlayers,
      playersBySport
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching player stats' });
  }
};

// --- 3. General admin dashboard statistics (Orders, Items, Suppliers) ---
const getStats = async (req, res) => {
  try {
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const totalItemsSold = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: null, total: { $sum: '$items.quantity' } } }
    ]);

    const totalInventoryItems = await Item.aggregate([
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    const totalOrders = await Order.countDocuments();

    // Expiring items in the next 30 days
    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);

    const expiringSoonItems = await Item.find({
      expiryDate: { $gte: today, $lte: next30Days }
    })
      .select('name expiryDate')
      .sort({ expiryDate: 1 })
      .limit(5);

    // Suppliers
    const totalSuppliers = await Supplier.countDocuments();
    const recentSuppliers = await Supplier.find()
      .select('name phone')
      .sort({ createdAt: -1 })
      .limit(3);

    const stats = {
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      totalItemsSold: totalItemsSold.length > 0 ? totalItemsSold[0].total : 0,
      totalInventoryItems: totalInventoryItems.length > 0 ? totalInventoryItems[0].total : 0,
      totalOrders,
      expiringSoonItems,
      totalSuppliers,
      recentSuppliers
    };

    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getMembershipStats,
  getPlayerStats,
  getStats
};

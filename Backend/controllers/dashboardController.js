// Backend/controllers/dashboardController.js — merged & conflict-free

const Order = require('../models/Order');
const Item = require('../models/Item');
const Supplier = require('../models/Supplier');
const Preorder = require('../models/Preorder');
const Member = require('../models/memberModel');
const Player = require('../models/PlayerModel');

// --- 1) Membership statistics (from Ayuni) ---
const getMembershipStats = async (req, res) => {
  try {
    const totalMembers = await Member.countDocuments();
    // Assuming `membership` field indicates active membership
    const activeMembers = await Member.countDocuments({ membership: { $ne: null } });
    const noMembership = Math.max(0, totalMembers - activeMembers);

    return res.status(200).json({
      totalMembers,
      activeMembers,
      noMembership,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching membership stats' });
  }
};

// --- 2) Player statistics (from Ayuni) ---
const getPlayerStats = async (req, res) => {
  try {
    const totalPlayers = await Player.countDocuments();

    const playersBySport = await Player.aggregate([
      { $group: { _id: '$sport', count: { $sum: 1 } } },
      { $project: { sport: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1, sport: 1 } },
    ]);

    return res.status(200).json({
      totalPlayers,
      playersBySport,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching player stats' });
  }
};

// --- 3) General Admin Dashboard statistics (MAIN2 enhanced + Ayuni extras) ---
const getStats = async (req, res) => {
  try {
    // ---- Core totals in parallel (robust fallbacks) ----
    const [
      totalRevenueResult, // [{ total }]
      totalItemsSoldResult, // [{ total }]
      totalInventoryItemsResult, // [{ total }]
      totalOrders,
      totalSuppliers,
      preorderCount,
    ] = await Promise.all([
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: null, total: { $sum: '$items.quantity' } } },
      ]),
      Item.aggregate([{ $group: { _id: null, total: { $sum: '$quantity' } } }]),
      Order.countDocuments(),
      Supplier.countDocuments(),
      Preorder.countDocuments({ status: { $in: ['requested', 'ordered'] } }),
    ]);

    const stats = {
      totalRevenue: totalRevenueResult[0]?.total || 0,
      totalItemsSold: totalItemsSoldResult[0]?.total || 0,
      totalInventoryItems: totalInventoryItemsResult[0]?.total || 0,
      totalOrders: totalOrders || 0,
      totalSuppliers: totalSuppliers || 0,
      preorderCount: preorderCount || 0,
      // filled below
      lowStockItems: [],
      lowStockCount: 0,
      expiringSoonItems: [],
      expiringSoonCount: 0,
      topSellingItems: [],
      recentSuppliers: [],            // (Ayuni extra)
      expiringWithin30Days: [],       // (Ayuni extra)
    };

    // ---- Low stock & Expiring soon (MAIN2 pipelines) ----
    const now = new Date();
    const soon = new Date();
    soon.setDate(soon.getDate() + 14); // next 14 days

    const [lowStockItems, expiringSoonItems, recentSuppliers, expiringWithin30Days] = await Promise.all([
      // Low stock: quantity < reorderPoint (missing reorderPoint = 0)
      Item.aggregate([
        { $match: { $expr: { $lt: ['$quantity', { $ifNull: ['$reorderPoint', 0] }] } } },
        {
          $lookup: {
            from: 'suppliers',
            localField: 'supplier',
            foreignField: '_id',
            as: 'supplier',
          },
        },
        { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            name: 1,
            quantity: 1,
            reorderPoint: 1,
            supplier: {
              _id: '$supplier._id',
              name: '$supplier.name',
              phone: '$supplier.phone',
              email: '$supplier.email',
              contactPerson: '$supplier.contactPerson',
            },
          },
        },
        { $sort: { quantity: 1 } },
        { $limit: 50 },
      ]),

      // Expiring soon (next 14 days) with supplier join
      Item.aggregate([
        { $match: { expiryDate: { $gte: now, $lte: soon } } },
        {
          $lookup: {
            from: 'suppliers',
            localField: 'supplier',
            foreignField: '_id',
            as: 'supplier',
          },
        },
        { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            name: 1,
            expiryDate: 1,
            quantity: 1,
            reorderPoint: 1,
            supplier: {
              _id: '$supplier._id',
              name: '$supplier.name',
              phone: '$supplier.phone',
              email: '$supplier.email',
              contactPerson: '$supplier.contactPerson',
            },
          },
        },
        { $sort: { expiryDate: 1 } },
        { $limit: 50 },
      ]),

      // Recent suppliers (Ayuni)
      Supplier.find().select('name phone').sort({ createdAt: -1 }).limit(3),

      // Expiring within next 30 days (Ayuni)
      (async () => {
        const next30Days = new Date();
        next30Days.setDate(now.getDate() + 30);
        return Item.find({ expiryDate: { $gte: now, $lte: next30Days } })
          .select('name expiryDate')
          .sort({ expiryDate: 1 })
          .limit(5);
      })(),
    ]);

    stats.lowStockItems = lowStockItems;
    stats.lowStockCount = lowStockItems.length;
    stats.expiringSoonItems = expiringSoonItems;
    stats.expiringSoonCount = expiringSoonItems.length;
    stats.recentSuppliers = recentSuppliers;
    stats.expiringWithin30Days = expiringWithin30Days;

    // ---- Top Selling Items (MAIN2 all‑time) ----
    const topSellingItems = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: { $ifNull: ['$items.item', '$items.itemId'] },
          sold: { $sum: '$items.quantity' },
          inlineName: { $first: { $ifNull: ['$items.name', '$items.itemName'] } },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'items', localField: '_id', foreignField: '_id', as: 'item' } },
      { $unwind: { path: 'item', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          name: { $ifNull: ['$item.name', '$inlineName'] },
          sold: 1,
        },
      },
    ]);

    stats.topSellingItems = topSellingItems; // [{ name, sold }]

    return res.json(stats);
  } catch (err) {
    console.error('Dashboard Stats Error:', err);
    return res.status(500).json({ msg: 'Server Error' });
  }
};

module.exports = {
  getMembershipStats,
  getPlayerStats,
  getStats,
};

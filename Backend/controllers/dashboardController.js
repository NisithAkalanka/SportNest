// Backend/controllers/dashboardController.js — merged + enhanced

const Order = require('../models/Order');
const Item = require('../models/Item');
const Supplier = require('../models/Supplier');
const Preorder = require('../models/Preorder');

const getStats = async (req, res) => {
  try {
    // ---- Core totals in parallel (safe fallbacks) ----
    const [
      totalRevenueResult, // [{ total }]
      totalItemsSoldResult, // [{ total }]
      totalInventoryItemsResult, // [{ total }]
      totalOrders,
      totalSuppliers,
      preorderCount
    ] = await Promise.all([
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.aggregate([{ $unwind: '$items' }, { $group: { _id: null, total: { $sum: '$items.quantity' } } }]),
      Item.aggregate([{ $group: { _id: null, total: { $sum: '$quantity' } } }]),
      Order.countDocuments(),
      Supplier.countDocuments(),
      Preorder.countDocuments({ status: { $in: ['requested', 'ordered'] } })
    ]);

    const stats = {
      totalRevenue: totalRevenueResult[0]?.total || 0,
      totalItemsSold: totalItemsSoldResult[0]?.total || 0,
      totalInventoryItems: totalInventoryItemsResult[0]?.total || 0,
      totalOrders: totalOrders || 0,
      totalSuppliers: totalSuppliers || 0,
      preorderCount: preorderCount || 0,
      expiringSoonItems: [],
      lowStockItems: []
    };

    // ---- Low stock & Expiring soon (original robust pipelines) ----
    const now = new Date();
    const soon = new Date();
    soon.setDate(soon.getDate() + 14); // next 14 days

    const [lowStockItems, expiringSoonItems] = await Promise.all([
      // Low stock: quantity < reorderPoint (missing reorderPoint = 0)
      Item.aggregate([
        {
          $match: { $expr: { $lt: ['$quantity', { $ifNull: ['$reorderPoint', 0] }] } }
        },
        {
          $lookup: {
            from: 'suppliers',
            localField: 'supplier',
            foreignField: '_id',
            as: 'supplier'
          }
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
              contactPerson: '$supplier.contactPerson'
            }
          }
        },
        { $sort: { quantity: 1 } },
        { $limit: 50 }
      ]),

      // Expiring soon: expiryDate between now and soon
      Item.aggregate([
        { $match: { expiryDate: { $gte: now, $lte: soon } } },
        {
          $lookup: {
            from: 'suppliers',
            localField: 'supplier',
            foreignField: '_id',
            as: 'supplier'
          }
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
              contactPerson: '$supplier.contactPerson'
            }
          }
        },
        { $sort: { expiryDate: 1 } },
        { $limit: 50 }
      ])
    ]);

    stats.lowStockItems = lowStockItems;
    stats.lowStockCount = lowStockItems.length;
    stats.expiringSoonItems = expiringSoonItems;
    stats.expiringSoonCount = expiringSoonItems.length;

    // ---- Top Selling Items (all‑time; FE also supports this shape) ----
    // Supports schemas where items have either `item` (ObjectId) or `itemId`,
    // and may carry an inline name (`name` / `itemName`).
    const topSellingItems = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: { $ifNull: ['$items.item', '$items.itemId'] },
          sold: { $sum: '$items.quantity' },
          inlineName: { $first: { $ifNull: ['$items.name', '$items.itemName'] } }
        }
      },
      { $sort: { sold: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'items', localField: '_id', foreignField: '_id', as: 'item' } },
      { $unwind: { path: '$item', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          name: { $ifNull: ['$item.name', '$inlineName'] },
          sold: 1
        }
      }
    ]);

    stats.topSellingItems = topSellingItems; // [{ name, sold }]

    return res.json(stats);
  } catch (err) {
    console.error('Dashboard Stats Error:', err);
    return res.status(500).json({ msg: 'Server Error' });
  }
};

module.exports = { getStats };
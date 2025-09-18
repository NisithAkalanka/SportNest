const Order = require('../models/Order');
const Item = require('../models/Item');
const Supplier = require('../models/Supplier'); // <-- Supplier model එක import කරගන්න

// @route   GET /api/dashboard/stats
// @desc    Get key statistics for the admin dashboard
// @access  Private (Admin Only)
const getStats = async (req, res) => {
  try {
    // --- දැනටමත් තිබූ Stats ---
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

    // --- අලුතින් එකතු කළ Summaries ---
    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);

    // ඊළඟ දවස් 30 ඇතුලත expire වන items
    const expiringSoonItems = await Item.find({
      expiryDate: { $gte: today, $lte: next30Days }
    }).select('name expiryDate').sort({ expiryDate: 1 }).limit(5); // ළඟම expire වෙන 5 දෙනවා
    
    // suppliers ලාගේ summary එක
    const totalSuppliers = await Supplier.countDocuments();
    const recentSuppliers = await Supplier.find().select('name phone').sort({ createdAt: -1 }).limit(3); // අලුතෙන්ම add කරපු 3 දෙනවා

    const stats = {
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      totalItemsSold: totalItemsSold.length > 0 ? totalItemsSold[0].total : 0,
      totalInventoryItems: totalInventoryItems.length > 0 ? totalInventoryItems[0].total : 0,
      totalOrders: totalOrders,
      
      // අලුත් දත්ත ටික response එකට එකතු කරනවා
      expiringSoonItems: expiringSoonItems,
      totalSuppliers: totalSuppliers,
      recentSuppliers: recentSuppliers
    };
    
    res.json(stats);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getStats
};
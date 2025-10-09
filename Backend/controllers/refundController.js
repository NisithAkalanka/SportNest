const Refund = require('../models/Refund');
const Order = require('../models/Order');
const Item = require('../models/Item');
const Member = require('../models/memberModel');
const sendEmail = require('../utils/email');

// @route   POST /api/refunds/request
// @desc    Create a refund request
// @access  Private (Member)
const requestRefund = async (req, res) => {
  try {
    const { orderId, items, reason, description, refundMethod } = req.body;
    const userId = req.user._id || req.user.id;

    console.log('Refund request data:', { orderId, items, reason, description, refundMethod, userId });

    // Validate required fields
    if (!orderId || !items || !reason || !description) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    // Validate order exists and belongs to user
    const order = await Order.findById(orderId)
      .populate('items.item')
      .populate('userId');

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    if (order.userId._id.toString() !== userId.toString()) {
      return res.status(403).json({ msg: 'Not authorized to refund this order' });
    }

    // Allow refund requests for all orders regardless of date
    // Removed 30-day restriction to allow refunds for all orders

    // Allow refund requests for all order statuses
    // Removed status restriction to allow refunds for all orders

    // Validate refund items
    const refundItems = [];
    let totalRefundAmount = 0;

    for (const refundItem of items) {
      const orderItem = order.items.find(
        item => item.item._id.toString() === refundItem.itemId
      );

      if (!orderItem) {
        return res.status(400).json({ 
          msg: `Item ${refundItem.itemId} not found in order` 
        });
      }

      if (refundItem.quantity > orderItem.quantity) {
        return res.status(400).json({ 
          msg: `Refund quantity cannot exceed ordered quantity for item ${orderItem.item.name}` 
        });
      }

      const refundAmount = orderItem.price * refundItem.quantity;
      totalRefundAmount += refundAmount;

      refundItems.push({
        item: refundItem.itemId,
        quantity: refundItem.quantity,
        originalPrice: orderItem.price,
        refundAmount: refundAmount
      });
    }

    // Check if refund already exists for this order
    const existingRefund = await Refund.findOne({ 
      orderId: orderId,
      status: { $in: ['pending', 'approved', 'processing'] }
    });

    if (existingRefund) {
      return res.status(400).json({ 
        msg: 'A refund request already exists for this order' 
      });
    }

    // Create refund request
    const refund = new Refund({
      orderId: orderId,
      userId: userId,
      items: refundItems,
      totalRefundAmount: totalRefundAmount,
      reason: reason,
      description: description,
      refundMethod: refundMethod || 'original_payment'
    });

    await refund.save();

    // Populate the refund with order and item details for response
    await refund.populate([
      { path: 'orderId', populate: { path: 'items.item' } },
      { path: 'userId', select: 'firstName lastName email' },
      { path: 'items.item', select: 'name price' }
    ]);

    // Send notification email to admin
    try {
      const adminEmails = ['admin@sportnest.com']; // You can make this configurable
      const emailSubject = `New Refund Request - ${refund.refundId}`;
      const emailBody = `
        <h2>New Refund Request</h2>
        <p><strong>Refund ID:</strong> ${refund.refundId}</p>
        <p><strong>Order ID:</strong> ${order.orderId}</p>
        <p><strong>Customer:</strong> ${order.userId.firstName} ${order.userId.lastName}</p>
        <p><strong>Total Refund Amount:</strong> Rs. ${totalRefundAmount.toFixed(2)}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Description:</strong> ${description}</p>
        <p><strong>Requested Date:</strong> ${refund.requestedDate.toLocaleDateString()}</p>
      `;

      await sendEmail(adminEmails, emailSubject, emailBody);
    } catch (emailError) {
      console.error('Failed to send refund notification email:', emailError);
    }

    res.status(201).json({
      msg: 'Refund request submitted successfully',
      refund: refund
    });

  } catch (err) {
    console.error('Refund Request Error:', err);
    res.status(500).json({ msg: 'Server Error: ' + err.message });
  }
};

// @route   GET /api/refunds/my-refunds
// @desc    Get user's refund requests
// @access  Private (Member)
const getMyRefunds = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { userId: userId };
    if (status) {
      query.status = status;
    }

    const refunds = await Refund.find(query)
      .populate('orderId', 'orderId orderDate status')
      .populate('items.item', 'name price imageUrl')
      .sort({ requestedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Refund.countDocuments(query);

    res.json({
      refunds,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (err) {
    console.error('Get My Refunds Error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @route   GET /api/refunds/:id
// @desc    Get refund by ID
// @access  Private
const getRefundById = async (req, res) => {
  try {
    const refund = await Refund.findById(req.params.id)
      .populate('orderId')
      .populate('userId', 'firstName lastName email phone')
      .populate('items.item', 'name price imageUrl')
      .populate('processedBy', 'firstName lastName');

    if (!refund) {
      return res.status(404).json({ msg: 'Refund not found' });
    }

    // Check if user is authorized to view this refund
    const userId = req.user._id || req.user.id;
    if (req.user.role !== 'admin' && refund.userId._id.toString() !== userId.toString()) {
      return res.status(403).json({ msg: 'Not authorized to view this refund' });
    }

    res.json(refund);

  } catch (err) {
    console.error('Get Refund Error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @route   GET /api/refunds
// @desc    Get all refunds (Admin only)
// @access  Private (Admin)
const getAllRefunds = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sortBy = 'requestedDate', sortOrder = 'desc' } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const refunds = await Refund.find(query)
      .populate('orderId', 'orderId orderDate status')
      .populate('userId', 'firstName lastName email')
      .populate('items.item', 'name price')
      .populate('processedBy', 'firstName lastName')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Refund.countDocuments(query);

    res.json({
      refunds,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (err) {
    console.error('Get All Refunds Error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @route   PUT /api/refunds/:id/approve
// @desc    Approve a refund request
// @access  Private (Admin)
const approveRefund = async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const refundId = req.params.id;
    const adminId = req.user._id || req.user.id;

    const refund = await Refund.findById(refundId)
      .populate('orderId')
      .populate('userId')
      .populate('items.item');

    if (!refund) {
      return res.status(404).json({ msg: 'Refund not found' });
    }

    if (refund.status !== 'pending') {
      return res.status(400).json({ 
        msg: 'Refund request has already been processed' 
      });
    }

    // Update refund status
    refund.status = 'approved';
    refund.adminNotes = adminNotes || '';
    refund.processedBy = adminId;
    refund.processedDate = new Date();

    await refund.save();

    // Send approval email to customer
    try {
      const emailSubject = `Refund Request Approved - ${refund.refundId}`;
      const emailBody = `
        <h2>Refund Request Approved</h2>
        <p>Dear ${refund.userId.firstName},</p>
        <p>Your refund request <strong>${refund.refundId}</strong> has been approved.</p>
        <p><strong>Refund Amount:</strong> Rs. ${refund.totalRefundAmount.toFixed(2)}</p>
        <p><strong>Refund Method:</strong> ${refund.refundMethod}</p>
        <p><strong>Admin Notes:</strong> ${adminNotes || 'No additional notes'}</p>
        <p>Your refund will be processed within 3-5 business days.</p>
        <p>Thank you for your patience.</p>
      `;

      await sendEmail([refund.userId.email], emailSubject, emailBody);
    } catch (emailError) {
      console.error('Failed to send refund approval email:', emailError);
    }

    res.json({
      msg: 'Refund request approved successfully',
      refund: refund
    });

  } catch (err) {
    console.error('Approve Refund Error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @route   PUT /api/refunds/:id/reject
// @desc    Reject a refund request
// @access  Private (Admin)
const rejectRefund = async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const refundId = req.params.id;
    const adminId = req.user._id || req.user.id;

    const refund = await Refund.findById(refundId)
      .populate('userId');

    if (!refund) {
      return res.status(404).json({ msg: 'Refund not found' });
    }

    if (refund.status !== 'pending') {
      return res.status(400).json({ 
        msg: 'Refund request has already been processed' 
      });
    }

    // Update refund status
    refund.status = 'rejected';
    refund.adminNotes = adminNotes || '';
    refund.processedBy = adminId;
    refund.processedDate = new Date();

    await refund.save();

    // Send rejection email to customer
    try {
      const emailSubject = `Refund Request Update - ${refund.refundId}`;
      const emailBody = `
        <h2>Refund Request Update</h2>
        <p>Dear ${refund.userId.firstName},</p>
        <p>Your refund request <strong>${refund.refundId}</strong> has been reviewed.</p>
        <p><strong>Status:</strong> Rejected</p>
        <p><strong>Reason:</strong> ${adminNotes || 'Please contact customer service for more information'}</p>
        <p>If you have any questions, please contact our customer service team.</p>
      `;

      await sendEmail([refund.userId.email], emailSubject, emailBody);
    } catch (emailError) {
      console.error('Failed to send refund rejection email:', emailError);
    }

    res.json({
      msg: 'Refund request rejected',
      refund: refund
    });

  } catch (err) {
    console.error('Reject Refund Error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @route   PUT /api/refunds/:id/complete
// @desc    Mark refund as completed
// @access  Private (Admin)
const completeRefund = async (req, res) => {
  try {
    const refundId = req.params.id;
    const adminId = req.user._id || req.user.id;

    const refund = await Refund.findById(refundId)
      .populate('orderId')
      .populate('userId')
      .populate('items.item');

    if (!refund) {
      return res.status(404).json({ msg: 'Refund not found' });
    }

    if (refund.status !== 'approved') {
      return res.status(400).json({ 
        msg: 'Only approved refunds can be marked as completed' 
      });
    }

    // Update refund status
    refund.status = 'completed';
    refund.processedBy = adminId;
    refund.processedDate = new Date();

    await refund.save();

    // Restore item quantities if needed
    for (const refundItem of refund.items) {
      await Item.findByIdAndUpdate(
        refundItem.item._id,
        { $inc: { quantity: refundItem.quantity } }
      );
    }

    // Send completion email to customer
    try {
      const emailSubject = `Refund Completed - ${refund.refundId}`;
      const emailBody = `
        <h2>Refund Completed</h2>
        <p>Dear ${refund.userId.firstName},</p>
        <p>Your refund request <strong>${refund.refundId}</strong> has been completed.</p>
        <p><strong>Refund Amount:</strong> Rs. ${refund.totalRefundAmount.toFixed(2)}</p>
        <p><strong>Refund Method:</strong> ${refund.refundMethod}</p>
        <p>The refund has been processed and should appear in your account within 3-5 business days.</p>
        <p>Thank you for your business!</p>
      `;

      await sendEmail([refund.userId.email], emailSubject, emailBody);
    } catch (emailError) {
      console.error('Failed to send refund completion email:', emailError);
    }

    res.json({
      msg: 'Refund marked as completed successfully',
      refund: refund
    });

  } catch (err) {
    console.error('Complete Refund Error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @route   GET /api/refunds/stats/summary
// @desc    Get refund statistics (Admin only)
// @access  Private (Admin)
const getRefundStats = async (req, res) => {
  try {
    const stats = await Refund.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalRefundAmount' }
        }
      }
    ]);

    const totalRefunds = await Refund.countDocuments();
    const totalRefundAmount = await Refund.aggregate([
      { $group: { _id: null, total: { $sum: '$totalRefundAmount' } } }
    ]);

    res.json({
      statusBreakdown: stats,
      totalRefunds,
      totalRefundAmount: totalRefundAmount[0]?.total || 0
    });

  } catch (err) {
    console.error('Get Refund Stats Error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

module.exports = {
  requestRefund,
  getMyRefunds,
  getRefundById,
  getAllRefunds,
  approveRefund,
  rejectRefund,
  completeRefund,
  getRefundStats
};

const PreOrderPayment = require('../models/PreOrderPayment');
const Supplier = require('../models/Supplier');

// @route   POST /api/admin/pre-order-payments
// @desc    Log a pre-order payment
// @access  Private (Admin only)
const logPreOrderPayment = async (req, res) => {
  try {
    console.log('=== PreOrderPayment Request ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Admin ID:', req.admin?._id);
    
    const {
      supplierId,
      supplierName,
      bank,
      accountName,
      accountNumber,
      amount,
      paymentMethod,
      referenceNumber,
      paymentDate,
      notes,
      preOrderId,
      status
    } = req.body;

    // Validate required fields
    if (!supplierId || !amount || !paymentMethod) {
      console.log('Validation failed - missing required fields:', {
        supplierId: !!supplierId,
        amount: !!amount,
        paymentMethod: !!paymentMethod
      });
      return res.status(400).json({ 
        message: 'Supplier ID, amount, and payment method are required' 
      });
    }

    // Validate admin authentication
    if (!req.admin || !req.admin._id) {
      console.log('Authentication failed - no admin or admin ID');
      return res.status(401).json({ 
        message: 'Admin authentication required' 
      });
    }

    // Verify supplier exists
    console.log('Looking for supplier with ID:', supplierId);
    const supplier = await Supplier.findById(supplierId);
    console.log('Found supplier:', supplier ? 'Yes' : 'No');
    if (supplier) {
      console.log('Supplier details:', {
        name: supplier.name,
        bankName: supplier.bankName,
        accountName: supplier.accountName,
        accountNumber: supplier.accountNumber
      });
    }
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Create payment record
    const paymentData = {
      supplierId,
      supplierName: supplierName || supplier.name,
      bank: bank || supplier.bankName, // Fixed: use bankName from supplier model
      accountName: accountName || supplier.accountName,
      accountNumber: accountNumber || supplier.accountNumber,
      amount: parseFloat(amount),
      paymentMethod,
      referenceNumber: referenceNumber || `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      paymentDate: paymentDate || new Date(),
      notes: notes || '',
      preOrderId: preOrderId || null,
      status: status || 'completed',
      loggedBy: req.admin._id,
      loggedAt: new Date()
    };

    console.log('Payment data to save:', JSON.stringify(paymentData, null, 2));

    const payment = new PreOrderPayment(paymentData);
    console.log('PreOrderPayment model created, attempting to save...');
    await payment.save();
    console.log('Payment saved successfully with ID:', payment._id);

    // Update supplier's total payments if needed (only if the field exists)
    try {
      await Supplier.findByIdAndUpdate(supplierId, {
        $inc: { totalPayments: parseFloat(amount) },
        lastPaymentDate: new Date()
      });
      console.log('Supplier payment totals updated successfully');
    } catch (updateError) {
      console.log('Warning: Could not update supplier payment totals:', updateError.message);
      // Don't fail the entire operation if this update fails
    }

    res.status(201).json({
      message: 'Payment logged successfully',
      payment: {
        id: payment._id,
        supplierName: payment.supplierName,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        referenceNumber: payment.referenceNumber,
        paymentDate: payment.paymentDate,
        status: payment.status
      }
    });

  } catch (error) {
    console.error('=== ERROR in logPreOrderPayment ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Full error object:', error);
    
    res.status(500).json({ 
      message: 'Server error logging payment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   GET /api/admin/pre-order-payments
// @desc    Get all pre-order payments
// @access  Private (Admin only)
const getPreOrderPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, supplierId, status } = req.query;
    
    const query = {};
    if (supplierId) query.supplierId = supplierId;
    if (status) query.status = status;

    const payments = await PreOrderPayment.find(query)
      .populate('supplierId', 'name email phone')
      .populate('loggedBy', 'firstName lastName')
      .sort({ paymentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PreOrderPayment.countDocuments(query);

    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error fetching pre-order payments:', error);
    res.status(500).json({ message: 'Server error fetching payments' });
  }
};

// @route   GET /api/admin/pre-order-payments/:id
// @desc    Get payment details
// @access  Private (Admin only)
const getPaymentDetails = async (req, res) => {
  try {
    const payment = await PreOrderPayment.findById(req.params.id)
      .populate('supplierId', 'name email phone address')
      .populate('loggedBy', 'firstName lastName email');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);

  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({ message: 'Server error fetching payment details' });
  }
};

// @route   GET /api/admin/pre-order-payments/financial/all
// @desc    Get all pre-order payments for financial dashboard
// @access  Private (Admin only)
const getAllPreOrderPaymentsForFinancial = async (req, res) => {
  try {
    console.log('=== Fetching Pre-Order Payments for Financial Dashboard ===');
    
    const payments = await PreOrderPayment.find({ status: 'completed' })
      .populate('supplierId', 'name email phone')
      .populate('loggedBy', 'firstName lastName')
      .sort({ paymentDate: -1 });

    const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
    console.log(`Found ${payments.length} pre-order payments with total amount: ${totalAmount}`);

    res.json({
      payments,
      totalAmount,
      count: payments.length
    });

  } catch (error) {
    console.error('Error fetching pre-order payments for financial dashboard:', error);
    res.status(500).json({ message: 'Server error fetching pre-order payments' });
  }
};

module.exports = {
  logPreOrderPayment,
  getPreOrderPayments,
  getPaymentDetails,
  getAllPreOrderPaymentsForFinancial
};

const PaymentMethod = require('../models/PaymentMethod');

// @route   GET /api/payments/methods
// @desc    Get user's saved payment methods
// @access  Private
const getPaymentMethods = async (req, res) => {
  try {
    const userId = req.user.id;

    const paymentMethods = await PaymentMethod.find({ 
      userId, 
      isActive: true 
    }).sort({ isDefault: -1, lastUsed: -1 });

    res.json(paymentMethods);

  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ message: 'Server error fetching payment methods' });
  }
};

// @route   POST /api/payments/methods
// @desc    Save a new payment method
// @access  Private
const savePaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, cardName, cardNumber, expiryMonth, expiryYear, isDefault } = req.body;

    // If this is set as default, unset other defaults
    if (isDefault) {
      await PaymentMethod.updateMany(
        { userId },
        { isDefault: false }
      );
    }

    const paymentMethod = new PaymentMethod({
      userId,
      type,
      cardName,
      cardNumber,
      expiryMonth,
      expiryYear,
      isDefault: isDefault || false
    });

    await paymentMethod.save();

    res.status(201).json({
      message: 'Payment method saved successfully',
      paymentMethod
    });

  } catch (error) {
    console.error('Error saving payment method:', error);
    res.status(500).json({ message: 'Server error saving payment method' });
  }
};

// @route   PUT /api/payments/methods/:methodId
// @desc    Update a payment method
// @access  Private
const updatePaymentMethod = async (req, res) => {
  try {
    const { methodId } = req.params;
    const userId = req.user.id;
    const { type, cardName, cardNumber, expiryMonth, expiryYear } = req.body;

    const paymentMethod = await PaymentMethod.findOne({ 
      _id: methodId, 
      userId 
    });

    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    paymentMethod.type = type;
    paymentMethod.cardName = cardName;
    paymentMethod.cardNumber = cardNumber;
    paymentMethod.expiryMonth = expiryMonth;
    paymentMethod.expiryYear = expiryYear;

    await paymentMethod.save();

    res.json({
      message: 'Payment method updated successfully',
      paymentMethod
    });

  } catch (error) {
    console.error('Error updating payment method:', error);
    res.status(500).json({ message: 'Server error updating payment method' });
  }
};

// @route   PUT /api/payments/methods/:methodId/default
// @desc    Set a payment method as default
// @access  Private
const setDefaultPaymentMethod = async (req, res) => {
  try {
    const { methodId } = req.params;
    const userId = req.user.id;

    // Unset all other defaults
    await PaymentMethod.updateMany(
      { userId },
      { isDefault: false }
    );

    // Set this one as default
    const paymentMethod = await PaymentMethod.findOneAndUpdate(
      { _id: methodId, userId },
      { isDefault: true },
      { new: true }
    );

    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    res.json({
      message: 'Default payment method updated successfully',
      paymentMethod
    });

  } catch (error) {
    console.error('Error setting default payment method:', error);
    res.status(500).json({ message: 'Server error setting default payment method' });
  }
};

// @route   DELETE /api/payments/methods/:methodId
// @desc    Delete a payment method
// @access  Private
const deletePaymentMethod = async (req, res) => {
  try {
    const { methodId } = req.params;
    const userId = req.user.id;

    const paymentMethod = await PaymentMethod.findOne({ 
      _id: methodId, 
      userId 
    });

    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    await PaymentMethod.findByIdAndDelete(methodId);

    res.json({ message: 'Payment method deleted successfully' });

  } catch (error) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({ message: 'Server error deleting payment method' });
  }
};

module.exports = {
  getPaymentMethods,
  savePaymentMethod,
  updatePaymentMethod,
  setDefaultPaymentMethod,
  deletePaymentMethod
};






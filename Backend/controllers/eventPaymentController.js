// Backend/controllers/eventPaymentController.js
const EventPayment = require('../models/EventPayment');
const Event = require('../models/Event');
const PaymentMethod = require('../models/PaymentMethod');
const sendEmail = require('../utils/email');

// @route   POST /api/events/payment
// @desc    Process event registration payment
// @access  Public
const processEventPayment = async (req, res) => {
  try {
    const {
      eventId,
      amount,
      registrationData,
      paymentInfo,
      billingInfo,
      savePaymentInfo,
      createAccount
    } = req.body;

    // Validate required fields
    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    if (!registrationData || !registrationData.name || !registrationData.email) {
      return res.status(400).json({ message: 'Registration data is required' });
    }

    // Verify event exists and has capacity
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is at capacity
    const currentRegistrations = await EventPayment.countDocuments({ 
      eventId, 
      status: { $in: ['completed', 'pending'] } 
    });
    
    if (currentRegistrations >= event.capacity) {
      return res.status(400).json({ message: 'Event is at full capacity' });
    }

    // Check if email is already registered for this event
    const existingRegistration = await EventPayment.findOne({
      eventId,
      'registrationData.email': registrationData.email,
      status: { $in: ['completed', 'pending'] }
    });

    if (existingRegistration) {
      return res.status(400).json({ message: 'Email already registered for this event' });
    }

    // Create payment record
    const paymentData = {
      eventId,
      participantId: req.user?.id, // Optional, for logged-in users
      registrationData,
      amount: amount || event.registrationFee || 200, // Use provided amount, event fee, or default 200
      status: 'completed',
      transactionId: `EVT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // Only add payment and billing info if they exist
    if (paymentInfo) {
      paymentData.paymentInfo = paymentInfo;
    }
    if (billingInfo) {
      paymentData.billingInfo = billingInfo;
    }

    const payment = new EventPayment(paymentData);
    await payment.save();

    // Save payment method if requested, user is logged in, and payment info is provided
    if (savePaymentInfo && req.user?.id && paymentInfo) {
      try {
        // Set other payment methods as non-default
        await PaymentMethod.updateMany(
          { userId: req.user.id },
          { isDefault: false }
        );

        const paymentMethod = new PaymentMethod({
          userId: req.user.id,
          type: paymentInfo.method,
          cardName: paymentInfo.cardName,
          cardNumber: paymentInfo.cardNumber,
          expiryMonth: paymentInfo.expiryMonth,
          expiryYear: paymentInfo.expiryYear,
          isDefault: true
        });

        await paymentMethod.save();
      } catch (error) {
        console.error('Error saving payment method:', error);
        // Don't fail the payment if saving payment method fails
      }
    }

    // Send confirmation email
    try {
      const emailContent = `
        <h2>Event Registration Confirmed!</h2>
        <p>Dear ${registrationData.name},</p>
        <p>Your registration for "${event.name}" has been confirmed.</p>
        
        <h3>Event Details:</h3>
        <ul>
          <li><strong>Event:</strong> ${event.name}</li>
          <li><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${event.startTime} - ${event.endTime}</li>
          <li><strong>Venue:</strong> ${event.venue || 'TBD'}</li>
        </ul>
        
        <h3>Registration Details:</h3>
        <ul>
          <li><strong>Name:</strong> ${registrationData.name}</li>
          <li><strong>Email:</strong> ${registrationData.email}</li>
          <li><strong>Phone:</strong> ${registrationData.phone}</li>
        </ul>
        
        <p>Thank you for registering! We look forward to seeing you at the event.</p>
      `;

      await sendEmail({
        to: registrationData.email,
        subject: `Event Registration Confirmed - ${event.name}`,
        html: emailContent
      });
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      // Don't fail the payment if email fails
    }

    res.status(201).json({
      message: 'Payment processed successfully',
      paymentId: payment._id,
      transactionId: payment.transactionId
    });

  } catch (error) {
    console.error('Error processing event payment:', error);
    
    // Provide more specific error messages
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.message 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid data format' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error processing payment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   GET /api/events/:eventId/payments
// @desc    Get all payments for an event
// @access  Private (Admin only)
const getEventPayments = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const query = { eventId };
    if (status) {
      query.status = status;
    }

    const payments = await EventPayment.find(query)
      .populate('participantId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await EventPayment.countDocuments(query);

    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error fetching event payments:', error);
    res.status(500).json({ message: 'Server error fetching payments' });
  }
};

// @route   GET /api/events/payments/:paymentId
// @desc    Get payment details
// @access  Private
const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await EventPayment.findById(paymentId)
      .populate('eventId', 'name description date startTime endTime venue')
      .populate('participantId', 'firstName lastName email');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if user has access to this payment
    if (req.user?.id !== payment.participantId?._id?.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(payment);

  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({ message: 'Server error fetching payment details' });
  }
};

// @route   PUT /api/events/payments/:paymentId/refund
// @desc    Process refund for event payment
// @access  Private (Admin only)
const processRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { refundAmount, refundReason } = req.body;

    const payment = await EventPayment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed payments can be refunded' });
    }

    payment.status = 'refunded';
    payment.refundAmount = refundAmount || payment.amount;
    payment.refundDate = new Date();
    payment.refundReason = refundReason;

    await payment.save();

    res.json({
      message: 'Refund processed successfully',
      payment
    });

  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ message: 'Server error processing refund' });
  }
};

// @route   DELETE /api/events/payments/:paymentId
// @desc    Delete payment record
// @access  Private (Admin only)
const deletePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await EventPayment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    await EventPayment.findByIdAndDelete(paymentId);

    res.json({ message: 'Payment deleted successfully' });

  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ message: 'Server error deleting payment' });
  }
};

module.exports = {
  processEventPayment,
  getEventPayments,
  getPaymentDetails,
  processRefund,
  deletePayment
};

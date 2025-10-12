const EventPayment = require('../models/EventPayment');
const Event = require('../models/Event');
const PaymentMethod = require('../models/PaymentMethod');
const sendEmail = require('../utils/email');

// @route   GET /api/events/payment/health
// @desc    Health check for payment endpoint
// @access  Public
const healthCheck = async (req, res) => {
  try {
    console.log('🏥 Payment health check requested');
    
    // Test database connection
    const eventCount = await Event.countDocuments();
    const paymentCount = await EventPayment.countDocuments();
    
    res.json({
      status: 'healthy',
      message: 'Payment endpoint is working',
      database: {
        events: eventCount,
        payments: paymentCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('💥 Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      message: 'Payment endpoint has issues',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// @route   POST /api/events/payment
// @desc    Process event registration payment
// @access  Public
const processEventPayment = async (req, res) => {
  try {
    console.log('🔄 Processing event payment request...');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
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
      console.log('❌ Missing eventId');
      return res.status(400).json({ message: 'Event ID is required' });
    }

    // Validate eventId format (MongoDB ObjectId)
    if (!/^[0-9a-fA-F]{24}$/.test(eventId)) {
      console.log('❌ Invalid eventId format:', eventId);
      return res.status(400).json({ message: 'Invalid event ID format' });
    }

    if (!registrationData || !registrationData.name || !registrationData.email) {
      console.log('❌ Missing registration data:', registrationData);
      return res.status(400).json({ message: 'Registration data is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registrationData.email)) {
      console.log('❌ Invalid email format:', registrationData.email);
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Verify event exists and has capacity
    console.log('🔍 Looking for event with ID:', eventId);
    let event;
    try {
      event = await Event.findById(eventId);
    } catch (dbError) {
      console.log('❌ Database error finding event:', dbError.message);
      return res.status(500).json({ message: 'Database error occurred' });
    }
    
    if (!event) {
      console.log('❌ Event not found with ID:', eventId);
      return res.status(404).json({ message: 'Event not found' });
    }
    console.log('✅ Event found:', event.name);

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

    // Log the amount being stored for debugging
    console.log(`Event Payment - Event: ${event.name}, Amount: ${paymentData.amount}, Provided: ${amount}, Event Fee: ${event.registrationFee}`);

    // Only add payment and billing info if they exist
    if (paymentInfo) {
      paymentData.paymentInfo = paymentInfo;
    }
    if (billingInfo) {
      paymentData.billingInfo = billingInfo;
    }

    console.log('💾 Creating payment record...');
    console.log('💾 Payment data:', JSON.stringify(paymentData, null, 2));
    
    let payment;
    try {
      payment = new EventPayment(paymentData);
      await payment.save();
      console.log('✅ Payment record created with ID:', payment._id);
    } catch (saveError) {
      console.error('❌ Error saving payment:', saveError);
      console.error('❌ Save error details:', saveError.message);
      console.error('❌ Save error stack:', saveError.stack);
      return res.status(500).json({ 
        message: 'Failed to save payment record',
        error: process.env.NODE_ENV === 'development' ? saveError.message : 'Database save error'
      });
    }

    // Update the event's registration count by adding to registrations array
    console.log('📝 Updating event registration count...');
    try {
      event.registrations.push({
        name: registrationData.name,
        email: registrationData.email,
        phone: registrationData.phone,
        registeredAt: new Date()
      });
      await event.save();
      console.log('✅ Event registration count updated');
    } catch (eventSaveError) {
      console.error('❌ Error updating event:', eventSaveError);
      console.error('❌ Event save error details:', eventSaveError.message);
      // Don't fail the payment if event update fails - payment is already saved
      console.log('⚠️ Payment saved but event update failed');
    }

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

    // Send confirmation email (optional - don't fail payment if email fails)
    // Move email sending to a separate async function to prevent blocking
    setImmediate(async () => {
      try {
        // Check if email configuration is available
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
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
          console.log('✅ Confirmation email sent successfully');
        } else {
          console.log('⚠️ Email configuration not available - skipping email notification');
        }
      } catch (error) {
        console.error('❌ Error sending confirmation email:', error.message);
        // Don't fail the payment if email fails - this is optional
      }
    });

    console.log('🎉 Payment processed successfully!');
    res.status(201).json({
      message: 'Payment processed successfully',
      paymentId: payment._id,
      transactionId: payment.transactionId
    });

  } catch (error) {
    console.error('💥 Error processing event payment:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more specific error messages
    if (error.name === 'ValidationError') {
      console.log('❌ Validation error:', error.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.message 
      });
    }
    
    if (error.name === 'CastError') {
      console.log('❌ Cast error:', error.message);
      return res.status(400).json({ 
        message: 'Invalid data format' 
      });
    }
    
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      console.log('❌ Database error:', error.message);
      return res.status(500).json({ 
        message: 'Database error occurred',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Database error'
      });
    }
    
    console.log('❌ Unknown error:', error.message);
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

// @route   GET /api/events/payments/all
// @desc    Get all event payments for financial dashboard
// @access  Private (Admin only)
const getAllEventPayments = async (req, res) => {
  try {
    const { status = 'completed' } = req.query;

    const query = { status };
    
    const payments = await EventPayment.find(query)
      .populate('eventId', 'name date registrationFee')
      .populate('participantId', 'firstName lastName email')
      .sort({ paymentDate: -1 });

    // Calculate total revenue
    const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    // Log for debugging
    console.log(`Event Payments Summary - Total Payments: ${payments.length}, Total Revenue: ${totalRevenue}`);
    payments.forEach(payment => {
      console.log(`Payment: ${payment.eventId?.name || 'Unknown Event'} - Amount: ${payment.amount}`);
    });

    res.json({
      payments,
      totalRevenue,
      totalCount: payments.length
    });

  } catch (error) {
    console.error('Error fetching all event payments:', error);
    res.status(500).json({ message: 'Server error fetching all payments' });
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
  healthCheck,
  processEventPayment,
  getEventPayments,
  getAllEventPayments,
  getPaymentDetails,
  processRefund,
  deletePayment
};

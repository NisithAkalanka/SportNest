const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const Driver = require('../models/Driver');
const { Parser } = require('json2csv');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

// POST /api/deliveries (Admin only)
const addDelivery = async (req, res) => {
  const { orderId, customer, address, deliveryDate, status, notes, driverId } = req.body;

  try {
    // Validate required fields
    if (!orderId || !customer || !address || !deliveryDate) {
      return res.status(400).json({ msg: 'Order ID, Customer, Address, and Delivery Date are required' });
    }

    // Check if order ID already exists
    const existingDelivery = await Delivery.findOne({ orderId });
    if (existingDelivery) {
      return res.status(400).json({ msg: 'Delivery with this Order ID already exists' });
    }

    // Validate delivery date is in the future
    const deliveryDateObj = new Date(deliveryDate);
    if (isNaN(deliveryDateObj.getTime())) {
      return res.status(400).json({ msg: 'Invalid delivery date format' });
    }
    if (deliveryDateObj <= new Date()) {
      return res.status(400).json({ msg: 'Delivery date must be in the future' });
    }

    // Validate customer name (allow letters, spaces, numbers, and common punctuation)
    if (!/^[a-zA-Z0-9\s.,-]+$/.test(customer)) {
      return res.status(400).json({ msg: 'Customer name contains invalid characters' });
    }

    // Get driver information if driverId is provided
    let driverInfo = null;
    let driverEmail = null;
    let confirmationToken = null;
    
    if (driverId) {
      driverInfo = await Driver.findById(driverId);
      if (!driverInfo) {
        return res.status(404).json({ msg: 'Driver not found' });
      }
      driverEmail = driverInfo.email;
      confirmationToken = crypto.randomBytes(32).toString('hex');
    }

    const delivery = await Delivery.create({ 
      orderId, 
      customer, 
      address, 
      deliveryDate: deliveryDateObj, 
      status: driverId ? 'Assigned' : (status || 'Pending'),
      notes,
      driver: driverId,
      driverEmail,
      confirmationToken
    });

    // Send email to driver if driver is assigned
    if (driverId && driverEmail && confirmationToken) {
      try {
        const confirmationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/driver/confirm-delivery/${confirmationToken}`;
        
        const emailSubject = `New Delivery Assignment - Order ${orderId}`;
        const emailContent = `
          <h2>Delivery Assignment</h2>
          <p>Hello ${driverInfo.fullName},</p>
          <p>You have been assigned a new delivery:</p>
          <ul>
            <li><strong>Order ID:</strong> ${orderId}</li>
            <li><strong>Customer:</strong> ${customer}</li>
            <li><strong>Address:</strong> ${address}</li>
            <li><strong>Delivery Date:</strong> ${deliveryDateObj.toLocaleDateString()}</li>
            <li><strong>Notes:</strong> ${notes || 'No additional notes'}</li>
          </ul>
          <p>Please click the link below to confirm delivery completion:</p>
          <a href="${confirmationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirm Delivery</a>
          <p>This link will expire in 7 days.</p>
          <p>Best regards,<br>SportNest Team</p>
        `;

        await sendEmail({
          to: driverEmail,
          subject: emailSubject,
          html: emailContent
        });

        console.log('Delivery assignment email sent to:', driverEmail);
      } catch (emailError) {
        console.error('Failed to send delivery email:', emailError);
        // Don't fail the delivery creation if email fails
      }
    }
    
    return res.status(201).json(delivery);
  } catch (err) {
    console.error('Add Delivery Error:', err.message);
    console.error('Request body:', req.body);
    
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ 
        msg: 'Validation failed', 
        errors: validationErrors 
      });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Order ID already exists' });
    }
    
    return res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// GET /api/deliveries (Admin only)
const getDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .sort({ deliveryDate: 1, createdAt: -1 });
    return res.json(deliveries);
  } catch (err) {
    console.error('Get Deliveries Error:', err.message);
    return res.status(500).send('Server Error');
  }
};

// GET /api/deliveries/:id (Admin only)
const getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ msg: 'Delivery not found' });
    }
    return res.json(delivery);
  } catch (err) {
    console.error('Get Delivery Error:', err.message);
    return res.status(500).send('Server Error');
  }
};

// PUT /api/deliveries/:id (Admin only)
const updateDelivery = async (req, res) => {
  try {
    const { orderId, customer, address, deliveryDate, status, notes, driverId } = req.body;

    // Get the original delivery to check for driver changes
    const originalDelivery = await Delivery.findById(req.params.id);
    if (!originalDelivery) {
      return res.status(404).json({ msg: 'Delivery not found' });
    }

    // If updating order ID, check for duplicates
    if (orderId) {
      const existingDelivery = await Delivery.findOne({ 
        orderId, 
        _id: { $ne: req.params.id } 
      });
      if (existingDelivery) {
        return res.status(400).json({ msg: 'Order ID already exists' });
      }
    }

    // If updating delivery date, validate it's in the future
    if (deliveryDate) {
      const deliveryDateObj = new Date(deliveryDate);
      if (deliveryDateObj <= new Date()) {
        return res.status(400).json({ msg: 'Delivery date must be in the future' });
      }
    }

    // If updating customer name, validate format
    if (customer && !/^[a-zA-Z\s]+$/.test(customer)) {
      return res.status(400).json({ msg: 'Customer name must contain only letters and spaces' });
    }

    // Check if driver is being assigned or changed
    let driverInfo = null;
    let driverEmail = null;
    let confirmationToken = null;
    
    if (driverId && driverId !== originalDelivery.driver?.toString()) {
      driverInfo = await Driver.findById(driverId);
      if (!driverInfo) {
        return res.status(404).json({ msg: 'Driver not found' });
      }
      driverEmail = driverInfo.email;
      confirmationToken = crypto.randomBytes(32).toString('hex');
    }

    // Prepare update data
    const updateData = { ...req.body };
    if (driverId && driverInfo) {
      updateData.driver = driverId;
      updateData.driverEmail = driverEmail;
      updateData.confirmationToken = confirmationToken;
      updateData.status = 'Assigned';
    }

    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!delivery) {
      return res.status(404).json({ msg: 'Delivery not found' });
    }

    // Send email to driver if driver is assigned or changed
    if (driverId && driverEmail && confirmationToken) {
      try {
        const confirmationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/driver/confirm-delivery/${confirmationToken}`;
        
        const emailSubject = `Delivery Assignment Updated - Order ${delivery.orderId}`;
        const emailContent = `
          <h2>Delivery Assignment</h2>
          <p>Hello ${driverInfo.fullName},</p>
          <p>You have been assigned to a delivery:</p>
          <ul>
            <li><strong>Order ID:</strong> ${delivery.orderId}</li>
            <li><strong>Customer:</strong> ${delivery.customer}</li>
            <li><strong>Address:</strong> ${delivery.address}</li>
            <li><strong>Delivery Date:</strong> ${new Date(delivery.deliveryDate).toLocaleDateString()}</li>
            <li><strong>Notes:</strong> ${delivery.notes || 'No additional notes'}</li>
          </ul>
          <p>Please click the link below to confirm delivery completion:</p>
          <a href="${confirmationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirm Delivery</a>
          <p>This link will expire in 7 days.</p>
          <p>Best regards,<br>SportNest Team</p>
        `;

        await sendEmail({
          to: driverEmail,
          subject: emailSubject,
          html: emailContent
        });

        console.log('Delivery assignment email sent to:', driverEmail);
      } catch (emailError) {
        console.error('Failed to send delivery email:', emailError);
        // Don't fail the delivery update if email fails
      }
    }
    
    return res.json(delivery);
  } catch (err) {
    console.error('Update Delivery Error:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: Object.values(err.errors)[0].message });
    }
    return res.status(500).send('Server Error');
  }
};

// DELETE /api/deliveries/:id (Admin only)
const deleteDelivery = async (req, res) => {
  try {
    const existing = await Delivery.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ msg: 'Delivery not found' });
    }

    await Delivery.findByIdAndDelete(req.params.id);
    return res.json({ msg: 'Delivery removed successfully' });
  } catch (err) {
    console.error('Delete Delivery Error:', err.message);
    return res.status(500).send('Server Error');
  }
};

// GET /api/deliveries/report/csv (Admin only)
const generateDeliveryCsvReport = async (req, res) => {
  try {
    const deliveries = await Delivery.find().sort({ deliveryDate: 1 });

    if (deliveries.length === 0) {
      return res.status(404).json({ msg: 'No deliveries found to generate a report.' });
    }

    const fields = [
      { label: 'Order ID', value: 'orderId' },
      { label: 'Customer', value: 'customer' },
      { label: 'Address', value: 'address' },
      { label: 'Delivery Date', value: 'deliveryDate' },
      { label: 'Status', value: 'status' },
      { label: 'Notes', value: 'notes' },
      { label: 'Created At', value: 'createdAt' }
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(deliveries);

    const date = new Date().toISOString().split('T')[0];
    const fileName = `deliveries-report-${date}.csv`;

    res.header('Content-Type', 'text/csv');
    res.attachment(fileName);
    return res.status(200).send(csv);

  } catch (err) {
    console.error('Delivery CSV Report Error:', err.message);
    return res.status(500).send('Server Error while generating report');
  }
};

// GET /api/deliveries/stats (Admin only)
const getDeliveryStats = async (req, res) => {
  try {
    const stats = await Delivery.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalDeliveries = await Delivery.countDocuments();
    const todayDeliveries = await Delivery.countDocuments({
      deliveryDate: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    return res.json({
      statusBreakdown: stats,
      totalDeliveries,
      todayDeliveries
    });
  } catch (err) {
    console.error('Get Delivery Stats Error:', err.message);
    return res.status(500).send('Server Error');
  }
};

// GET /api/deliveries/available-orders (Admin only)
const getAvailableOrders = async (req, res) => {
  try {
    // Get all orders that don't have delivery entries yet
    const ordersWithDeliveries = await Delivery.distinct('orderId');
    
    const availableOrders = await Order.find({
      orderId: { $nin: ordersWithDeliveries }
    })
    .populate('userId', 'firstName lastName email')
    .populate('items.item', 'name price')
    .sort({ orderDate: -1 });
    
    return res.json(availableOrders);
  } catch (err) {
    console.error('Get Available Orders Error:', err.message);
    return res.status(500).send('Server Error');
  }
};

// POST /api/deliveries/auto-create (Admin only)
const autoCreateDelivery = async (req, res) => {
  const { orderId } = req.body;
  
  try {
    // Check if delivery already exists
    const existingDelivery = await Delivery.findOne({ orderId });
    if (existingDelivery) {
      return res.status(400).json({ msg: 'Delivery already exists for this order' });
    }
    
    // Get order details
    const order = await Order.findOne({ orderId })
      .populate('userId', 'firstName lastName email');
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    // Create delivery with order information
    const delivery = await Delivery.create({
      orderId: order.orderId,
      customer: `${order.userId.firstName} ${order.userId.lastName}`,
      address: order.shippingAddress ? 
        `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.province}` : 
        'Address not provided',
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'Pending',
      notes: `Auto-created delivery for order ${order.orderId}`
    });
    
    return res.status(201).json(delivery);
  } catch (err) {
    console.error('Auto Create Delivery Error:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: Object.values(err.errors)[0].message });
    }
    return res.status(500).send('Server Error');
  }
};

// GET /api/deliveries/available-drivers (Admin only)
const getAvailableDrivers = async (req, res) => {
  try {
    console.log('Fetching available drivers...');
    
    // First, let's check if there are any drivers at all
    const allDrivers = await Driver.find({}).select('_id fullName email phone status');
    console.log('Total drivers in database:', allDrivers.length);
    console.log('All drivers:', allDrivers);
    
    // Then get only active drivers
    const drivers = await Driver.find({ status: 'Active' })
      .select('_id fullName email phone')
      .sort({ fullName: 1 });
    
    console.log('Found active drivers:', drivers.length);
    console.log('Active drivers:', drivers);
    
    return res.json(drivers || []);
  } catch (err) {
    console.error('Get Available Drivers Error:', err);
    console.error('Error details:', err.message);
    console.error('Error stack:', err.stack);
    
    // If there's an error, return empty array instead of error
    console.log('Returning empty drivers array due to error');
    return res.json([]);
  }
};

// GET /api/deliveries/confirm/:token (Public - Driver confirmation)
const confirmDelivery = async (req, res) => {
  const { token } = req.params;
  
  try {
    console.log('Confirming delivery for token:', token);
    
    // Validate token format
    if (!token || typeof token !== 'string' || !/^[a-f0-9]+$/i.test(token)) {
      console.log('Invalid token format for confirmation:', token);
      return res.status(400).json({ 
        msg: 'Invalid token format' 
      });
    }
    
    const delivery = await Delivery.findOne({ 
      confirmationToken: token,
      driverConfirmed: false 
    }).populate('driver', 'fullName email');
    
    console.log('Found delivery for confirmation:', delivery ? 'Yes' : 'No');
    
    if (!delivery) {
      return res.status(404).json({ 
        msg: 'Invalid or expired confirmation link' 
      });
    }
    
    // Check if token is not expired (7 days)
    const tokenAge = Date.now() - delivery.createdAt.getTime();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    
    if (tokenAge > maxAge) {
      return res.status(400).json({ 
        msg: 'Confirmation link has expired' 
      });
    }
    
    // Update delivery status
    delivery.driverConfirmed = true;
    delivery.confirmationDate = new Date();
    delivery.status = 'Delivered';
    await delivery.save();
    
    console.log('Delivery confirmed successfully:', delivery.orderId);
    
    // Send email notification to admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'nethmin703@gmail.com';
      const emailSubject = `Delivery Confirmed - Order ${delivery.orderId}`;
      const emailContent = `
        <h2>Delivery Confirmation Notification</h2>
        <p>Hello Admin,</p>
        <p>A delivery has been confirmed by the assigned driver.</p>
        
        <h3>Delivery Details:</h3>
        <ul>
          <li><strong>Order ID:</strong> ${delivery.orderId}</li>
          <li><strong>Customer:</strong> ${delivery.customer}</li>
          <li><strong>Address:</strong> ${delivery.address}</li>
          <li><strong>Driver:</strong> ${delivery.driver ? delivery.driver.fullName : 'Not assigned'}</li>
          <li><strong>Driver Email:</strong> ${delivery.driver ? delivery.driver.email : 'N/A'}</li>
          <li><strong>Delivery Date:</strong> ${new Date(delivery.deliveryDate).toLocaleString()}</li>
          <li><strong>Confirmed At:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        
        <p>You can view the updated delivery status in the admin dashboard.</p>
        
        <p>Best regards,<br>SportNest Delivery System</p>
      `;
      
      await sendEmail({
        to: adminEmail,
        subject: emailSubject,
        html: emailContent
      });
      console.log('Admin notification email sent successfully for delivery:', delivery.orderId);
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError);
      // Don't fail the confirmation if email fails
    }
    
    return res.json({
      success: true,
      message: 'Delivery confirmed successfully',
      delivery: {
        orderId: delivery.orderId,
        customer: delivery.customer,
        address: delivery.address,
        deliveryDate: delivery.deliveryDate,
        confirmedAt: delivery.confirmationDate
      }
    });
    
  } catch (err) {
    console.error('Confirm Delivery Error:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      token: token
    });
    
    // Check if it's a database connection error
    if (err.name === 'MongoNetworkError' || err.name === 'MongoServerError') {
      console.error('Database connection error detected in confirmation');
      return res.status(500).json({ 
        msg: 'Database connection error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Database unavailable'
      });
    }
    
    return res.status(500).json({ 
      msg: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// GET /api/deliveries/confirmation-status/:token (Public - Check confirmation status)
const getConfirmationStatus = async (req, res) => {
  const { token } = req.params;
  
  try {
    console.log('Getting confirmation status for token:', token);
    console.log('Token length:', token ? token.length : 'undefined');
    
    // Validate token format (should be a hex string)
    if (!token || typeof token !== 'string' || !/^[a-f0-9]+$/i.test(token)) {
      console.log('Invalid token format:', token);
      return res.status(400).json({ 
        msg: 'Invalid token format' 
      });
    }
    
    // Check if Delivery model is properly loaded
    if (!Delivery) {
      console.error('Delivery model is not loaded');
      return res.status(500).json({ 
        msg: 'Database model error' 
      });
    }
    
    console.log('Searching for delivery with token...');
    const delivery = await Delivery.findOne({ confirmationToken: token })
      .populate('driver', 'fullName email')
      .lean(); // Use lean() for better performance and to avoid mongoose document issues
    
    console.log('Found delivery:', delivery ? 'Yes' : 'No');
    if (delivery) {
      console.log('Delivery details:', {
        orderId: delivery.orderId,
        customer: delivery.customer,
        driverConfirmed: delivery.driverConfirmed,
        hasDriver: !!delivery.driver
      });
    }
    
    if (!delivery) {
      return res.status(404).json({ 
        msg: 'Invalid confirmation link' 
      });
    }
    
    return res.json({
      orderId: delivery.orderId,
      customer: delivery.customer,
      address: delivery.address,
      deliveryDate: delivery.deliveryDate,
      driver: delivery.driver,
      status: delivery.status,
      driverConfirmed: delivery.driverConfirmed,
      confirmationDate: delivery.confirmationDate
    });
    
  } catch (err) {
    console.error('Get Confirmation Status Error:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      token: token,
      tokenType: typeof token,
      tokenLength: token ? token.length : 'undefined'
    });
    
    // Check if it's a database connection error
    if (err.name === 'MongoNetworkError' || err.name === 'MongoServerError') {
      console.error('Database connection error detected');
      return res.status(500).json({ 
        msg: 'Database connection error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Database unavailable'
      });
    }
    
    return res.status(500).json({ 
      msg: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// GET /api/deliveries/test-drivers (Debug endpoint)
const testDrivers = async (req, res) => {
  try {
    console.log('Testing Driver model...');
    
    // Test basic Driver operations
    const count = await Driver.countDocuments();
    console.log('Driver count:', count);
    
    // Try to find any drivers
    const anyDrivers = await Driver.find({}).limit(5);
    console.log('Any drivers found:', anyDrivers);
    
    // Check active drivers specifically
    const activeDrivers = await Driver.find({ status: 'Active' });
    console.log('Active drivers:', activeDrivers);
    
    return res.json({
      success: true,
      count,
      drivers: anyDrivers,
      activeDrivers: activeDrivers,
      message: 'Driver model is working'
    });
  } catch (err) {
    console.error('Test Drivers Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack
    });
  }
};

// GET /api/deliveries/test-database (Debug endpoint)
const testDatabase = async (req, res) => {
  try {
    console.log('Testing database connection and models...');
    
    // Test Delivery model
    const deliveryCount = await Delivery.countDocuments();
    console.log('Delivery count:', deliveryCount);
    
    // Test Driver model
    const driverCount = await Driver.countDocuments();
    console.log('Driver count:', driverCount);
    
    // Test a simple query
    const recentDeliveries = await Delivery.find({}).limit(3).lean();
    console.log('Recent deliveries:', recentDeliveries.length);
    
    return res.json({
      success: true,
      deliveryCount,
      driverCount,
      recentDeliveries: recentDeliveries.length,
      message: 'Database connection and models are working',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Test Database Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack,
      message: 'Database test failed'
    });
  }
};

// POST /api/deliveries/test-email (Debug endpoint)
const testEmail = async (req, res) => {
  try {
    console.log('Testing email functionality...');
    
    const adminEmail = process.env.ADMIN_EMAIL || 'nisithakalanka15@gmail.com';
    const { to = adminEmail } = req.body;
    
    const emailOptions = {
      to: to,
      subject: 'Test Email from SportNest Delivery System',
      html: `
        <h2>Test Email - SportNest Delivery System</h2>
        <p>Hello Admin,</p>
        <p>This is a test email to verify that the email configuration is working correctly.</p>
        
        <h3>Configuration Details:</h3>
        <ul>
          <li><strong>Admin Email:</strong> ${adminEmail}</li>
          <li><strong>Test Time:</strong> ${new Date().toLocaleString()}</li>
          <li><strong>System:</strong> SportNest Delivery Management</li>
        </ul>
        
        <p>If you receive this email, the admin notification system is working properly.</p>
        
        <p>Best regards,<br>SportNest Delivery System</p>
      `,
      message: 'This is a test email from SportNest delivery system.'
    };
    
    await sendEmail(emailOptions);
    
    return res.json({
      success: true,
      message: `Test email sent successfully to ${to}`,
      to: to,
      adminEmail: adminEmail,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Test Email Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
      message: 'Email test failed. Check email configuration.',
      adminEmail: process.env.ADMIN_EMAIL || 'nisithakalanka15@gmail.com',
      stack: err.stack
    });
  }
};

module.exports = {
  addDelivery,
  getDeliveries,
  getDeliveryById,
  updateDelivery,
  deleteDelivery,
  generateDeliveryCsvReport,
  getDeliveryStats,
  getAvailableOrders,
  autoCreateDelivery,
  getAvailableDrivers,
  confirmDelivery,
  getConfirmationStatus,
  testDrivers,
  testDatabase,
  testEmail
};

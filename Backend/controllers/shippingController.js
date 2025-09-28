// Backend/controllers/shippingController.js
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Item = require('../models/Item');
const sendEmail = require('../utils/email');

// Process shipping and payment
const processShipping = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      address, 
      city, 
      province, 
      postalCode, 
      country,
      paymentMethod 
    } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.item');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ msg: 'Cart is empty' });
    }

    // Calculate total
    const totalAmount = cart.items.reduce((total, cartItem) => {
      return total + (cartItem.item.price * cartItem.quantity);
    }, 0);

    // Create order
    const order = new Order({
      userId: req.user.id,
      items: cart.items.map(cartItem => ({
        item: cartItem.item._id,
        quantity: cartItem.quantity,
        price: cartItem.item.price
      })),
      shippingAddress: {
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        province,
        postalCode,
        country
      },
      paymentMethod: {
        type: 'credit_card',
        cardName: paymentMethod.cardName,
        cardNumber: paymentMethod.cardNumber,
        expiryMonth: paymentMethod.expiryMonth,
        expiryYear: paymentMethod.expiryYear
      },
      totalAmount,
      status: 'processing'
    });

    await order.save();

    // Clear cart
    await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { items: [] }
    );

    // Send confirmation email
    try {
      await sendEmail({
        to: email,
        subject: 'Order Confirmation - SportNest',
        html: `
          <h2>Thank you for your order!</h2>
          <p>Your order #${order._id} has been received and is being processed.</p>
          <h3>Order Details:</h3>
          <ul>
            ${order.items.map(item => `
              <li>${item.item.name} - Quantity: ${item.quantity} - Rs. ${item.price}</li>
            `).join('')}
          </ul>
          <p><strong>Total: Rs. ${totalAmount}</strong></p>
          <p>We'll send you another email when your order ships.</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    res.json({ 
      msg: 'Order processed successfully', 
      orderId: order._id,
      totalAmount 
    });

  } catch (error) {
    console.error('Shipping processing error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get shipping rates (placeholder for future implementation)
const getShippingRates = async (req, res) => {
  try {
    // For now, return free shipping
    const rates = [
      {
        name: 'Standard Shipping',
        price: 0,
        estimatedDays: '3-5 business days'
      }
    ];

    res.json({ rates });
  } catch (error) {
    console.error('Get shipping rates error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Track order
const trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ 
      _id: orderId, 
      userId: req.user.id 
    }).populate('items.item');

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('items.item')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  processShipping,
  getShippingRates,
  trackOrder,
  getUserOrders
};

const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Preorder = require('../models/Preorder');
const Delivery = require('../models/Delivery');

// @route   POST /api/orders/checkout
// @desc    Create an order from the cart
// @access  Public
const checkout = async (req, res) => {
  try {
    // දැනට තියෙන එකම cart එක හොයාගන්නවා
    const cart = await Cart.findOne().populate('items.item');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ msg: 'Cart is empty' });
    }

    // මුළු මුදල ගණනය කිරීම
    const totalAmount = cart.items.reduce((sum, cartItem) => {
      return sum + cartItem.item.price * cartItem.quantity;
    }, 0);

    // අලුත් Order එකක් නිර්මාණය කිරීම
    const order = new Order({
      userId: cart.userId,
      items: cart.items.map(cartItem => ({
        item: cartItem.item._id,
        quantity: cartItem.quantity,
        price: cartItem.item.price
      })),
      totalAmount: totalAmount
    });

    await order.save();

    // Automatically create delivery entry for the new order
    try {
      const delivery = new Delivery({
        orderId: order.orderId,
        customer: 'Customer', // This should be populated from user data
        address: 'Address', // This should be populated from shipping data
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'Pending',
        notes: 'Auto-generated delivery for order ' + order.orderId
      });
      
      await delivery.save();
      console.log('Auto-created delivery for order:', order.orderId);
    } catch (deliveryError) {
      console.error('Failed to auto-create delivery:', deliveryError);
      // Don't fail the order creation if delivery creation fails
    }

    // Order එක සෑදූ පසු, Cart එක හිස් කිරීම
    cart.items = [];
    await cart.save();

    // after creating order, update preorders for same item (optional: match qty or partial)
    try {
      await Preorder.updateMany(
        { item: { $in: order.items.map(it => it.item) }, status: { $ne: 'received' } },
        { $set: { status: 'received' } }
      );
    } catch (e) {
      console.error('Preorder auto-update failed', e);
    }

    res.status(201).json({ msg: 'Order placed successfully!', order });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/orders
// @desc    Get all orders (Admin only)
// @access  Private
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'firstName lastName email')
      .populate('items.item', 'name price')
      .sort({ orderDate: -1 });
    
    res.json(orders);
  } catch (err) {
    console.error('Get Orders Error:', err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'firstName lastName email')
      .populate('items.item', 'name price');
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    res.json(order);
  } catch (err) {
    console.error('Get Order Error:', err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  checkout,
  getAllOrders,
  getOrderById
};
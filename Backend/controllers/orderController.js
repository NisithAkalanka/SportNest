const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Preorder = require('../models/Preorder');

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
      items: cart.items.map(cartItem => ({
        itemId: cartItem.item._id,
        name: cartItem.item.name,
        quantity: cartItem.quantity,
        price: cartItem.item.price
      })),
      totalAmount: totalAmount
    });

    await order.save();

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

module.exports = {
  checkout
};
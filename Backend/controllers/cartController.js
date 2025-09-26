const Cart = require('../models/Cart');
const Item = require('../models/Item');

// @route   POST api/cart/add
// @desc    Add an item to the cart and decrease inventory
// @access  Private
const addToCart = async (req, res) => {
  const { itemId, quantity } = req.body;

  try {
    const itemToAdd = await Item.findById(itemId);

    if (!itemToAdd) {
      return res.status(404).json({ msg: 'Item not found' });
    }
    
    if (itemToAdd.quantity < quantity) {
      return res.status(400).json({ msg: 'Sorry, not enough items in stock' });
    }

    // Find or create user's cart
    let cart = await Cart.findOne({ userId: req.user.id }); 
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }
    
    // Check if item already exists in cart
    const itemIndex = cart.items.findIndex(p => p.item.toString() === itemId);

    if (itemIndex > -1) {
      // Update quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({ item: itemId, quantity: quantity });
    }
    
    await cart.save();
    
    // Populate the cart with item details
    const populatedCart = await Cart.findById(cart._id).populate('items.item', 'name price imageUrl');
    res.status(200).json(populatedCart);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
// @route   GET /api/cart
// @desc    Get all items in the cart
// @access  Private
const getCartItems = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.item', 'name price imageUrl');
    
    if (!cart) {
      return res.json({ items: [] });
    }

    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


const removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }

    // Find the item to remove
    const itemToRemove = cart.items.find(i => i._id.toString() === req.params.id);
    if (!itemToRemove) {
      return res.status(404).json({ msg: 'Item not found in cart' });
    }
    
    // Restore inventory
    const inventoryItem = await Item.findById(itemToRemove.item);
    if (inventoryItem) {
      inventoryItem.quantity += itemToRemove.quantity;
      await inventoryItem.save();
    }
    
    // Remove item from cart
    cart.items = cart.items.filter(i => i._id.toString() !== req.params.id);
    await cart.save();
    
    // Return updated cart
    const updatedCart = await Cart.findOne({ userId: req.user.id }).populate('items.item', 'name price imageUrl');
    res.json(updatedCart);

  } catch (err) {
    console.error("Remove from cart error:", err.message);
    res.status(500).send('Server Error');
  }
};


module.exports = {
  addToCart,
  getCartItems,
  removeCartItem
};

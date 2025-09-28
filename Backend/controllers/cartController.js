const Cart = require('../models/Cart');
const Item = require('../models/Item');

// Helper: resolve current user id (requires auth middleware upstream)
function getUserId(req) {
  return req.user?._id || req.user?.id || null;
}

// @route   POST /api/cart/add
// @desc    Add an item to the current user's cart and decrease inventory
// @access  Private (requires logged-in user)
const addToCart = async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ msg: 'Please log in to add items to your cart.' });

  const { itemId, quantity } = req.body;
  const qty = Math.max(1, Number(quantity) || 1);

  try {
    // 1) Validate & fetch inventory item
    const itemToAdd = await Item.findById(itemId);
    if (!itemToAdd) return res.status(404).json({ msg: 'Item not found' });
    if (itemToAdd.quantity < qty) {
      return res.status(400).json({ msg: 'Sorry, not enough items in stock' });
    }

    // 2) Find or create user's cart
    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    // 3) Upsert line item
    const idx = cart.items.findIndex((p) => p.item.toString() === String(itemId));
    if (idx > -1) {
      cart.items[idx].quantity += qty;
    } else {
      cart.items.push({ item: itemId, quantity: qty });
    }

    // 4) Decrease inventory and save
    itemToAdd.quantity -= qty;
    await itemToAdd.save();
    await cart.save();

    return res.status(200).json(cart);
  } catch (err) {
    console.error('addToCart error:', err.message);
    return res.status(500).send('Server Error');
  }
};

// @route   GET /api/cart
// @desc    Get current user's cart
// @access  Private
const getCartItems = async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ msg: 'Please log in to view your cart.' });

  try {
    const cart = await Cart.findOne({ userId }).populate('items.item', 'name price imageUrl');
    if (!cart) return res.json({ items: [] });
    return res.json(cart);
  } catch (err) {
    console.error('getCartItems error:', err.message);
    return res.status(500).send('Server Error');
  }
};

// @route   DELETE /api/cart/:id
// @desc    Remove one cart line item and restore inventory
// @access  Private
const removeCartItem = async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ msg: 'Please log in to modify your cart.' });

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ msg: 'Cart not found' });

    const line = cart.items.find((i) => i._id.toString() === req.params.id);
    if (!line) return res.status(404).json({ msg: 'Item not found in cart' });

    // Restore inventory
    const inventoryItem = await Item.findById(line.item);
    if (inventoryItem) {
      inventoryItem.quantity += line.quantity;
      await inventoryItem.save();
    }

    // Remove line and save cart
    cart.items = cart.items.filter((i) => i._id.toString() !== req.params.id);
    await cart.save();

    const updated = await Cart.findOne({ userId }).populate('items.item', 'name price imageUrl');
    return res.json(updated || { items: [] });
  } catch (err) {
    console.error('removeCartItem error:', err.message);
    return res.status(500).send('Server Error');
  }
};

// @route   PUT /api/cart/:id
// @desc    Update line quantity, adjusting inventory accordingly
// @access  Private
const updateCartItemQuantity = async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ msg: 'Please log in to modify your cart.' });

  const { id } = req.params; // cart line _id
  const { quantity } = req.body; // new quantity
  const newQty = Number(quantity);
  if (isNaN(newQty) || newQty < 1) {
    return res.status(400).json({ msg: 'Invalid quantity provided.' });
  }

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ msg: 'Cart not found' });

    const line = cart.items.find((i) => i._id.toString() === id);
    if (!line) return res.status(404).json({ msg: 'Item not found in cart' });

    const inventoryItem = await Item.findById(line.item);
    if (!inventoryItem) {
      // If original item disappeared, drop the line from cart
      cart.items = cart.items.filter((i) => i._id.toString() !== id);
      await cart.save();
      return res.status(404).json({ msg: 'Original item not found. It has been removed from your cart.' });
    }

    const diff = newQty - line.quantity; // positive = need more stock, negative = return stock

    if (diff > 0) {
      if (inventoryItem.quantity < diff) {
        return res.status(400).json({ msg: `Not enough stock. Only ${inventoryItem.quantity} more item(s) available.` });
      }
      inventoryItem.quantity -= diff;
      await inventoryItem.save();
    } else if (diff < 0) {
      inventoryItem.quantity += Math.abs(diff);
      await inventoryItem.save();
    }

    line.quantity = newQty;
    await cart.save();

    const updated = await Cart.findOne({ userId }).populate('items.item', 'name price imageUrl');
    return res.json(updated);
  } catch (err) {
    console.error('updateCartItemQuantity error:', err.message);
    return res.status(500).send('Server Error');
  }
};

module.exports = {
  addToCart,
  getCartItems,
  removeCartItem,
  updateCartItemQuantity,
};
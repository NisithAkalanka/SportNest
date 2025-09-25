const Cart = require('../models/Cart');
const Item = require('../models/Item');

const addToCart = async (req, res) => {
    const { itemId, quantity } = req.body;
    try {
        const itemToAdd = await Item.findById(itemId);
        if (!itemToAdd) return res.status(404).json({ msg: 'Item not found' });
        if (itemToAdd.quantity < quantity) return res.status(400).json({ msg: 'Sorry, not enough items in stock' });
        itemToAdd.quantity -= quantity;
        await itemToAdd.save();
        let cart = await Cart.findOne(); 
        if (!cart) cart = new Cart({ items: [] });
        const itemIndex = cart.items.findIndex(p => p.item.toString() === itemId);
        if (itemIndex > -1) {
          cart.items[itemIndex].quantity += quantity;
        } else {
          cart.items.push({ item: itemId, quantity: quantity });
        }
        await cart.save();
        const populatedCart = await Cart.findOne().populate('items.item', 'name price imageUrl');
        res.status(200).json(populatedCart);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const getCartItems = async (req, res) => {
  try {
    const cart = await Cart.findOne().populate('items.item', 'name price imageUrl');
    if (!cart) return res.json({ items: [] });
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne();
    if (!cart) return res.status(404).json({ msg: 'Cart not found' });
    const itemToRemove = cart.items.find(i => i._id.toString() === req.params.id);
    if (!itemToRemove) return res.status(404).json({ msg: 'Item not found in cart' });
    const inventoryItem = await Item.findById(itemToRemove.item);
    if (inventoryItem) {
      inventoryItem.quantity += itemToRemove.quantity;
      await inventoryItem.save();
    }
    cart.items = cart.items.filter(i => i._id.toString() !== req.params.id);
    await cart.save();
    const updatedCart = await Cart.findOne().populate('items.item', 'name price imageUrl');
    res.json(updatedCart);

  } catch (err) {
    console.error("Remove from cart error:", err.message);
    res.status(500).send('Server Error');
  }
};

// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★ මෙන්න අලුතින් එකතු කළ Quantity Update Function එක ★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
const updateCartItemQuantity = async (req, res) => {
    const { id } = req.params; // මේ cartItem එකේ _id එක
    const { quantity } = req.body; // frontend එකෙන් එවන අලුත් quantity එක

    if (isNaN(quantity) || Number(quantity) < 1) {
        return res.status(400).json({ msg: 'Invalid quantity provided.' });
    }

    try {
        const cart = await Cart.findOne();
        if (!cart) {
            return res.status(404).json({ msg: 'Cart not found' });
        }

        const cartItem = cart.items.find(i => i._id.toString() === id);
        if (!cartItem) {
            return res.status(404).json({ msg: 'Item not found in cart' });
        }
        
        const inventoryItem = await Item.findById(cartItem.item);
        if (!inventoryItem) {
            // Inventory එකේ item එක නැත්නම්, ඒක cart එකෙන් අයින් කරලා දානවා
            cart.items = cart.items.filter(i => i._id.toString() !== id);
            await cart.save();
            return res.status(404).json({ msg: 'Original item not found. It has been removed from your cart.' });
        }

        // quantity එකේ වෙනස ගණනය කරනවා
        const quantityDifference = Number(quantity) - cartItem.quantity;
        
        // Stock එක check කරනවා
        if (inventoryItem.quantity < quantityDifference) {
            return res.status(400).json({ msg: `Not enough stock. Only ${inventoryItem.quantity} more item(s) available.` });
        }
        
        // Inventory එකේ quantity එක update කරනවා
        inventoryItem.quantity -= quantityDifference;
        await inventoryItem.save();

        // Cart එකේ quantity එක update කරනවා
        cartItem.quantity = Number(quantity);
        await cart.save();
        
        // අලුත් cart එකම populate කරලා, response එකේ යවනවා
        const updatedCart = await Cart.findOne().populate('items.item', 'name price imageUrl');
        return res.json(updatedCart);

    } catch (err) {
        console.error("Update cart quantity error:", err.message);
        res.status(500).send('Server Error');
    }
};


module.exports = {
  addToCart,
  getCartItems,
  removeCartItem,
  updateCartItemQuantity // ★★★ අලුත් function එක export කරනවා ★★★
};
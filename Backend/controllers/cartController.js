const Cart = require('../models/Cart');
const Item = require('../models/Item');

// @route   POST api/cart/add
// @desc    Add an item to the cart and decrease inventory
// @access  Public (දැනට, ඕනෑම කෙනෙකුට add කරන්න පුළුවන්)
const addToCart = async (req, res) => {
  const { itemId, quantity } = req.body; // Frontend එකෙන් එවන දත්ත

  // --- 1. Item එකේ Stock එක Check කිරීම ---
  try {
    const itemToAdd = await Item.findById(itemId);

    if (!itemToAdd) {
      return res.status(404).json({ msg: 'Item not found' });
    }
    
    if (itemToAdd.quantity < quantity) {
      return res.status(400).json({ msg: 'Sorry, not enough items in stock' });
    }

    // --- 2. Inventory එකේ Quantity එක අඩු කිරීම ---
    itemToAdd.quantity -= quantity;
    await itemToAdd.save();

    // --- 3. Cart එකට Item එක එකතු කිරීම ---
    // දැනට, අපි හිතමු හැමෝටම තියෙන්නේ එකම cart එකක් කියලා.
    // අපි මුලින්ම බලනවා cart එකක් තියෙනවද කියලා, නැත්නම් අලුතින් හදනවා.
    let cart = await Cart.findOne(); 
    if (!cart) {
      cart = new Cart({ items: [] });
    }
    
    // Cart එකේ දැනටමත් මේ item එක තියෙනවද කියලා බලනවා
    const itemIndex = cart.items.findIndex(p => p.item.toString() === itemId);

    if (itemIndex > -1) {
      // තියෙනවා නම්, quantity එක විතරක් වැඩි කරනවා
      cart.items[itemIndex].quantity += quantity;
    } else {
      // නැත්නම්, අලුතින් item එක push කරනවා
      cart.items.push({ item: itemId, quantity: quantity });
    }
    
    await cart.save();
    
    res.status(200).json(cart);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
// @route   GET /api/cart
// @desc    Get all items in the cart
// @access  Public
const getCartItems = async (req, res) => {
  try {
    // අපි හිතනවා තියෙන්නේ එකම cart එකයි කියලා
    const cart = await Cart.findOne().populate('items.item', 'name price');
    
    if (!cart) {
      return res.json({ items: [] }); // Cart එකක් නැත්නම්, හිස් list එකක් යවනවා
    }

    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne();
    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }

    // Cart එකෙන් අයින් කරන item එක මොකක්ද, quantity එක කීයද කියලා හොයාගන්නවා
    const itemToRemove = cart.items.find(i => i._id.toString() === req.params.id);
    if (!itemToRemove) {
      return res.status(404).json({ msg: 'Item not found in cart' });
    }
    
    // Inventory එකේ අදාළ Item එක හොයාගන්නවා
    const inventoryItem = await Item.findById(itemToRemove.item);
    if (inventoryItem) {
      inventoryItem.quantity += itemToRemove.quantity;
      await inventoryItem.save();
    }
    
    // Cart එකෙන් item එක remove කරනවා
    cart.items = cart.items.filter(i => i._id.toString() !== req.params.id);
    await cart.save();
    
    // Update වෙච්ච අලුත් cart එකම populate කරලා, response එකේ යවනවා
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
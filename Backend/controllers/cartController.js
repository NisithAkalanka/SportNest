const Cart = require('../models/Cart');
const Item = require('../models/Item'); // Item model එකත් import කරගන්නවා

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

// (Cart එකේ දත්ත පෙන්වන function එක පසුව හදමු)
module.exports = {
  addToCart,
  getCartItems // <-- අලුතින් එකතු කළ නම
};
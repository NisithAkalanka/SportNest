const Item = require('../models/Item');

// @route   POST api/items
// @desc    Add a new item to inventory
// @access  Private (Admin Only)
const addItem = async (req, res) => {
  // පියවර 1: req.body එකෙන් එන අලුත් fields සියල්ලම වෙන් කරගැනීම
  const { 
    name, 
    category, 
    quantity, 
    reorderPoint, 
    supplier, 
    grn,
    price,         // <-- අලුත්
    batchNumber,   // <-- අලුත්
    expiryDate     // <-- අලුත්
  } = req.body;

  // මිල ඇතුළත් කර ඇත්දැයි පරීක්ෂා කිරීම
  if (price === undefined) {
    return res.status(400).json({ msg: 'Please add a price for the item' });
  }

  try {
    // පියවර 2: අලුත් Item object එක, සියලුම fields සමඟ නිර්මාණය කිරීම
    const newItem = new Item({
      name,
      category,
      quantity,
      reorderPoint,
      supplier,
      grn,
      price,
      batchNumber,
      expiryDate,
    });

    const item = await newItem.save();
    res.status(201).json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/items
// @desc    Get all items from inventory
// @access  Private (Admin Only)
const getItems = async (req, res) => {
  try {
    // 'supplier' ක්ෂේත්‍රය populate කරලා සැපයුම්කරුගේ නම සහ දුරකථන අංකයත් ලබාගැනීම
    const items = await Item.find()
      .populate('supplier', ['name', 'phone'])
      .sort({ name: 1 });
      
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   PUT api/items/:id
// @desc    Update an item
// @access  Private (Admin Only)
const updateItem = async (req, res) => {
  // පියවර 1: req.body එකෙන් එන අලුත් fields සියල්ලම වෙන් කරගැනීම
  const { 
    name, 
    category, 
    quantity, 
    reorderPoint, 
    supplier, 
    grn,
    price,
    batchNumber,
    expiryDate
  } = req.body;

  // යාවත්කාලීන කළ යුතු දත්ත ඇතුළත් object එකක් සෑදීම
  const itemFields = {};
  if (name) itemFields.name = name;
  if (category) itemFields.category = category;
  if (quantity !== undefined) itemFields.quantity = quantity;
  if (reorderPoint) itemFields.reorderPoint = reorderPoint;
  if (supplier) itemFields.supplier = supplier;
  if (grn) itemFields.grn = grn;
  if (price !== undefined) itemFields.price = price;
  if (batchNumber) itemFields.batchNumber = batchNumber;
  if (expiryDate) itemFields.expiryDate = expiryDate;

  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ msg: 'Item not found' });
    }

    // පියවර 2: සොයාගත් item එක, අලුත් දත්ත සමඟ යාවත්කාලීන කිරීම
    item = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: itemFields },
      { new: true }
    );

    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   DELETE api/items/:id
// @desc    Delete an item
// @access  Private (Admin Only)
const deleteItem = async (req, res) => {
  try {
    let item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ msg: 'Item not found' });
    }

    await Item.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Item removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
// @route   GET api/items/shop
// @desc    Get all items for the public shop view
// @access  Public
const getShopItems = async (req, res) => {
  try {
    // quantity එක 0 ට වඩා වැඩි items විතරක් තෝරලා, අවශ්‍ය fields ටික විතරක් අරගන්නවා
    const items = await Item.find({ quantity: { $gt: 0 } })
                            .select('name category price'); // <-- මේ fields 3 විතරයි select කරන්නේ
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


module.exports = {
    addItem,
    getItems,
    updateItem,
    deleteItem,
    getShopItems
}
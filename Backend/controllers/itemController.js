const Item = require('../models/Item');
const InventoryLog = require('../models/InventoryLog');
const cloudinary = require('cloudinary').v2;
const pdf = require('pdf-creator-node');
const fs = require('fs');
const path = require('path');


// @route   POST api/items
const addItem = async (req, res) => {
  // Destructure all text fields from the body
  const { name, category, quantity, reorderPoint, supplier, grn, price, batchNumber, expiryDate, description } = req.body;
  
  if (price === undefined) {
    return res.status(400).json({ msg: 'Please add a price for the item' });
  }

  try {
    const newItemData = { 
        name, category, quantity, reorderPoint, supplier, grn, price, batchNumber, expiryDate, description
    };

    // Check if an image file was uploaded by multer
    if (req.file) {
      newItemData.imageUrl = req.file.path;       // URL from Cloudinary
      newItemData.imagePublicId = req.file.filename; // Public ID to delete later
    }

    const newItem = new Item(newItemData);
    const item = await newItem.save();
    res.status(201).json(item);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


// @route   PUT api/items/:id
const updateItem = async (req, res) => {
  const { name, category, quantity, reorderPoint, supplier, grn, price, batchNumber, expiryDate, description } = req.body;
  
  const itemFields = {};
  if (name) itemFields.name = name;
  if (category) itemFields.category = category;
  if (quantity !== undefined) itemFields.quantity = quantity;
  if (reorderPoint) itemFields.reorderPoint = reorderPoint;
  if (supplier) itemFields.supplier = supplier;
  if (grn) itemFields.grn = grn;
  if (price !== undefined) itemFields.price = price;
  if (batchNumber) itemFields.batchNumber = batchNumber;
  if (expiryDate === '' || expiryDate) itemFields.expiryDate = expiryDate; // Handle clearing the date
  if (description === '' || description) itemFields.description = description; // Allow clearing or updating description

  try {
    let item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ msg: 'Item not found' });
    }

    // If a new image is being uploaded
    if (req.file) {
        // Delete the old image from Cloudinary if it exists
        if (item.imagePublicId) {
            await cloudinary.uploader.destroy(item.imagePublicId);
        }
        // Update with the new image details
        itemFields.imageUrl = req.file.path;
        itemFields.imagePublicId = req.file.filename;
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: itemFields },
      { new: true }
    ).populate('supplier', ['name', 'phone']);

    res.json(updatedItem);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


// @route   DELETE api/items/:id
const deleteItem = async (req, res) => {
  try {
    let item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ msg: 'Item not found' });
    }

    // Delete image from Cloudinary before deleting the item from DB
    if (item.imagePublicId) {
        await cloudinary.uploader.destroy(item.imagePublicId);
    }

    await Item.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Item removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


// --- පහත functions වල කිසිම වෙනසක් කර නොමැත ---

const getItems = async (req, res) => {
  try {
    const items = await Item.find().populate('supplier', ['name', 'phone']).sort({ name: 1 });
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const getShopItems = async (req, res) => {
  try {
    // imageUrl එකත් shop එකට යවනවා
    const items = await Item.find({ quantity: { $gt: 0 } }).select('name category price imageUrl description');
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const generateInventoryPdfReport = async (req, res) => {
    try {
        const itemsFromDB = await Item.find().populate('supplier', 'name').lean();
        if (itemsFromDB.length === 0) {
            return res.status(404).json({ msg: 'No data available to generate a report.' });
        }
        
        const formattedItems = itemsFromDB.map(item => {
            const price = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 0;
            return {
                name: item.name,
                category: item.category,
                supplierName: item.supplier ? item.supplier.name : 'N/A',
                quantity: quantity,
                priceFormatted: price.toFixed(2),
                totalValueFormatted: (price * quantity).toFixed(2)
            };
        });

        const totalValue = itemsFromDB.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0);
        
        const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const reportTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        const templatePath = path.join(__dirname, '..', 'templates', 'report-template.html');
        const htmlTemplate = fs.readFileSync(templatePath, 'utf8');

        const options = { format: "A4", orientation: "portrait", border: "10mm" };
        const reportDir = path.join(__dirname, '..', 'reports');
        if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir);
        const filePath = path.join(reportDir, `inventory-report-${Date.now()}.pdf`);

        const document = {
            html: htmlTemplate,
            data: { items: formattedItems, reportDate: reportDate, reportTime: reportTime, totalValueFormatted: totalValue.toFixed(2) },
            path: filePath
        };

        await pdf.create(document, options);

        res.download(filePath, 'inventory-report.pdf', (err) => {
            if (err) console.error("Error during file download:", err);
            fs.unlinkSync(filePath);
        });

    } catch (err) {
        console.error('Error creating PDF report:', err);
        res.status(500).send('Server Error during PDF report generation.');
    }
};


<<<<<<< Updated upstream
// ★★★ Newly added Function – Manual Stock Management ★★★

=======
>>>>>>> Stashed changes

// @route   POST /api/items/managestock
// @desc    Manually add or remove stock for an item
// @access  Admin
const manageStock = async (req, res) => {
  const { itemId, actionType, quantity, cost, reason } = req.body;

  if (!itemId || !actionType || !quantity) {
    return res.status(400).json({ msg: 'Missing required fields: itemId, actionType, quantity' });
  }

  const qty = Number(quantity);
  if (isNaN(qty) || qty <= 0) {
    return res.status(400).json({ msg: 'Quantity must be a positive number.' });
  }

  try {
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ msg: 'Item not found' });
    }

    let logType = '';
    let quantityChange = 0;

    if (actionType === 'add') {
      item.quantity += qty;
      logType = 'addition';
      quantityChange = qty;
    } else if (actionType === 'remove') {
      if (item.quantity < qty) {
        return res.status(400).json({ msg: `Cannot remove ${qty} units. Only ${item.quantity} are in stock.` });
      }
      item.quantity -= qty;
      logType = reason === 'Expired' ? 'removal_expired' : 'removal_damaged';
      quantityChange = -qty;
    } else {
      return res.status(400).json({ msg: 'Invalid action type.' });
    }
    
    await item.save();

    const logEntry = new InventoryLog({
      item: itemId,
      type: logType,
      quantityChange,
      cost: actionType === 'add' ? Number(cost) || 0 : 0,
      reason: actionType === 'remove' ? reason : undefined
    });
    await logEntry.save();
    
    res.json({ msg: 'Stock updated successfully!', item });

  } catch (err) {
    console.error('Manage Stock Error:', err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
    addItem,
    getItems,
    updateItem,
    deleteItem,
    getShopItems,
    generateInventoryPdfReport,
    manageStock
};
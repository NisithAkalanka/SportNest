const Preorder = require('../models/Preorder');
const Item = require('../models/Item');
const Supplier = require('../models/Supplier');
const nodemailer = require('nodemailer');
const { Parser } = require('json2csv');

// Nodemailer transporter 
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_PORT === '465',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  tls: { rejectUnauthorized: false }
});

// createPreorder function 
const createPreorder = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const item = await Item.findById(itemId).populate('supplier');
    if (!item) {
      return res.status(404).json({ msg: 'Item not found' });
    }
    if (!item.supplier || !item.supplier.email) {
      return res.status(400).json({ msg: 'Supplier with a valid email is required for pre-orders.' });
    }
    const preorder = await Preorder.create({
      item: item._id, supplier: item.supplier._id, quantity, status: 'requested'
    });
    try {
      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: item.supplier.email,
        subject: `New Pre-order Request: ${item.name}`,
        html: `<h3>New Pre-order Request</h3><p>Hello ${item.supplier.name},</p><p>A new pre-order has been placed for the following item:</p><ul><li><strong>Item:</strong> ${item.name}</li><li><strong>Quantity Requested:</strong> ${quantity}</li></ul><p>Please acknowledge this request at your earliest convenience.</p><p>Thank you.</p>`
      };
      await transporter.sendMail(mailOptions);
      console.log(`Pre-order email sent successfully to ${item.supplier.email}`);
    } catch (emailError) {
      console.error(`Failed to send pre-order email to ${item.supplier.email}:`, emailError);
    }
    const result = await Preorder.findById(preorder._id).populate('item supplier');
    return res.status(201).json({ msg: 'Pre-order created successfully!', preorder: result });
  } catch (error) {
    console.error("Create Pre-order Error:", error);
    return res.status(500).json({ msg: 'Server error while creating pre-order.' });
  }
};

// listPreorders function 
const listPreorders = async (req, res) => {
  try {
    const list = await Preorder.find().sort({ createdAt: -1 }).limit(200).populate('item supplier');
    return res.json({ preorders: list });
  } catch (err) {
    console.error('Preorder list error', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// updateStatus function 
const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status, expiryDate } = req.body;
  if (!['requested', 'ordered', 'received'].includes(status)) {
    return res.status(400).json({ msg: 'Invalid status' });
  }
  try {
    const preorderToUpdate = await Preorder.findById(id);
    if (!preorderToUpdate) {
        return res.status(404).json({ msg: 'Pre-order not found' });
    }
    if (preorderToUpdate.status === 'received' && status === 'received') {
      const alreadyReceivedOrder = await Preorder.findById(id).populate('item supplier');
      return res.json({ msg: 'Order is already marked as received.', preorder: alreadyReceivedOrder });
    }
    if (status === 'received') {
      const itemToUpdate = await Item.findById(preorderToUpdate.item);
      if (itemToUpdate) {
        itemToUpdate.quantity += preorderToUpdate.quantity;
        if (expiryDate) {
          itemToUpdate.expiryDate = new Date(expiryDate);
        }
        await itemToUpdate.save();
      } else {
        console.warn(`Could not update inventory. Item not found.`);
      }
    }
    preorderToUpdate.status = status;
    await preorderToUpdate.save();
    const updatedPreorder = await Preorder.findById(id).populate('item supplier');
    return res.json({ msg: 'Status updated successfully', preorder: updatedPreorder });
  } catch (err) {
      console.error("Update Status Error:", err);
      return res.status(500).json({ msg: 'Server error while updating status' });
  }
};

// report generation function
const generateMonthlyReport = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    const preorders = await Preorder.find({ createdAt: { $gte: startOfMonth, $lte: endOfMonth } }).populate('item supplier').sort({ createdAt: 1 });
    if (preorders.length === 0) {
      return res.status(404).json({ msg: 'No pre-orders found for the current month to generate a report.' });
    }
    const fields = [
      { label: 'Order Date', value: (row) => new Date(row.createdAt).toLocaleDateString('si-LK') },
      { label: 'Item Name', value: 'item.name' },
      { label: 'Supplier', value: 'supplier.name' },
      { label: 'Requested Quantity', value: 'quantity' },
      { label: 'Final Status', value: 'status' }
    ];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(preorders);
    const fileName = `preorder-report-${now.getFullYear()}-${now.getMonth() + 1}.csv`;
    res.header('Content-Type', 'text/csv');
    res.attachment(fileName);
    return res.status(200).send(csv);
  } catch (err) {
    console.error("Report Generation Error:", err);
    return res.status(500).json({ msg: 'Server error while generating report.' });
  }
};



const updatePreorderQuantity = async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
        return res.status(400).json({ msg: 'A valid, positive quantity is required.' });
    }
    try {
        const preorder = await Preorder.findById(id);
        if (!preorder) {
            return res.status(404).json({ msg: 'Pre-order not found.' });
        }
        if (preorder.status !== 'requested') {
            return res.status(400).json({ msg: `Cannot edit a pre-order with status '${preorder.status}'.` });
        }
        preorder.quantity = Number(quantity);
        await preorder.save();
        const updatedPreorder = await Preorder.findById(id).populate('item supplier');
        return res.json({ msg: 'Pre-order quantity updated successfully.', preorder: updatedPreorder });
    } catch (err) {
        console.error("Update Pre-order Quantity Error:", err);
        return res.status(500).json({ msg: 'Server error while updating pre-order.' });
    }
};

//deletePreorder function

const deletePreorder = async (req, res) => {
    const { id } = req.params;
    try {
        const preorder = await Preorder.findById(id);
        if (!preorder) {
            return res.status(404).json({ msg: 'Pre-order not found.' });
        }
        if (preorder.status !== 'requested') {
            return res.status(400).json({ msg: `Cannot delete a pre-order with status '${preorder.status}'.` });
        }
        await Preorder.findByIdAndDelete(id);
        return res.json({ msg: 'Pre-order successfully deleted.' });
    } catch (err) {
        console.error("Delete Pre-order Error:", err);
        return res.status(500).json({ msg: 'Server error while deleting pre-order.' });
    }
};



module.exports = { 
  createPreorder, 
  listPreorders, 
  updateStatus,
  generateMonthlyReport,
  updatePreorderQuantity,
  deletePreorder
};
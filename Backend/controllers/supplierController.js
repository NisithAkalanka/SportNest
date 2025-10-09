const Supplier = require('../models/Supplier');
const Preorder = require('../models/Preorder');
const { Parser } = require('json2csv');

// @route   POST /api/suppliers
// @desc    Add a new supplier
// @access  Admin
const addSupplier = async (req, res) => {
  // Destructure all fields from the body, including new bank details
  const { 
    name, 
    contactPerson, 
    email, 
    phone, 
    address, 
    bankName, 
    accountNumber, 
    accountName 
  } = req.body;

  try {
    const existingSupplier = await Supplier.findOne({ email });
    if (existingSupplier) {
      return res.status(400).json({ msg: 'Supplier with this email already exists' });
    }

    // Create a new supplier with all the received data
    const supplier = await Supplier.create({ 
      name, 
      contactPerson, 
      email, 
      phone, 
      address, 
      bankName, 
      accountNumber, 
      accountName 
    });
    
    return res.status(201).json(supplier);

  } catch (err) {
    console.error('Add Supplier Error:', err.message);
    return res.status(500).send('Server Error');
  }
};

// @route   GET /api/suppliers
// @desc    Get all suppliers with their pre-orders
// @access  Admin
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.aggregate([
      { $match: {} },
      {
        $lookup: {
          from: 'preorders',      // Make sure your collection name is 'preorders'
          localField: '_id',
          foreignField: 'supplier',
          as: 'preorders'
        }
      },
      // Now including bank details in the projection
      { 
        $project: { 
          name: 1, 
          email: 1, 
          phone: 1, 
          contactPerson: 1, 
          address: 1,
          bankName: 1, 
          accountNumber: 1, 
          accountName: 1,
          preorders: { $slice: ['$preorders', 20] } // Limit preorders for performance
        } 
      },
      { $sort: { name: 1 } }
    ]);
    return res.json(suppliers);
  } catch(err) {
    console.error('Get Suppliers Error:', err.message);
    return res.status(500).send('Server Error');
  }
};

// @route   PUT /api/suppliers/:id
// @desc    Update an existing supplier
// @access  Admin
const updateSupplier = async (req, res) => {
  try {
    // req.body can now contain the new bank detail fields. 
    // $set will update whichever fields are present in req.body.
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true } // 'new: true' returns the updated document
    );
    
    if (!supplier) {
        return res.status(404).json({ msg: 'Supplier not found' });
    }
    
    return res.json(supplier);

  } catch (err) {
    console.error('Update Supplier Error:', err.message);
    return res.status(500).send('Server Error');
  }
};

// @route   DELETE /api/suppliers/:id
// @desc    Delete a supplier
// @access  Admin
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ msg: 'Supplier not found' });
    }
    
    // You might want to add a check here: if the supplier is linked to any items or pre-orders, maybe prevent deletion.
    // For now, we proceed with deletion.

    await Supplier.findByIdAndDelete(req.params.id);
    return res.json({ msg: 'Supplier removed successfully' });

  } catch (err) {
    console.error('Delete Supplier Error:', err.message);
    return res.status(500).send('Server Error');
  }
};

// @route   GET /api/suppliers/all
// @desc    Get all suppliers (Public or for internal use)
// @access  Public/Private
const getAllSuppliers = async (_req, res) => {
  try {
    // Also including bank details here in case they are needed for dropdowns etc.
    const suppliers = await Supplier.find().sort({ name: 1 });
    return res.json(suppliers);
  } catch (err) {
    console.error('Public GetAll Suppliers Error:', err.message);
    return res.status(500).send('Server Error');
  }
};

// @route   GET /api/suppliers/report/csv
// @desc    Generate a CSV report of 
// @access  Admin
const generateSupplierCsvReport = async (req, res) => {
    try {
        const suppliers = await Supplier.find().sort({ name: 1 });

        if (suppliers.length === 0) {
            return res.status(404).json({ msg: 'No suppliers found to generate a report.' });
        }

        // Add the new bank fields to the CSV report
        const fields = [
            { label: 'Supplier Name', value: 'name' },
            { label: 'Contact Person', value: 'contactPerson' },
            { label: 'Email Address', value: 'email' },
            { label: 'Phone Number', value: 'phone' },
            { label: 'Address', value: 'address' },
            { label: 'Bank Name', value: 'bankName' },
            { label: 'Account Holder Name', value: 'accountName' },
            { label: 'Account Number', value: 'accountNumber' },
        ];

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(suppliers);

        const date = new Date().toISOString().split('T')[0];
        const fileName = `suppliers-report-${date}.csv`;

        res.header('Content-Type', 'text/csv');
        res.attachment(fileName);
        return res.status(200).send(csv);

    } catch (err) {
        console.error('Supplier CSV Report Error:', err.message);
        return res.status(500).send('Server Error while generating report');
    }
};


module.exports = {
  addSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
  getAllSuppliers,
  generateSupplierCsvReport
};
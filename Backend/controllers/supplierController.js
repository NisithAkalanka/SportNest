const Supplier = require('../models/Supplier');
const Preorder = require('../models/Preorder');
const { Parser } = require('json2csv'); // ★★★ CSV eka hadanna  library eka import kirima

// POST /api/suppliers  (Admin only)
const addSupplier = async (req, res) => {
  const { name, contactPerson, email, phone, address } = req.body; //aluthin supplier add karanna ona data

  try {
    const existingSupplier = await Supplier.findOne({ email });
    if (existingSupplier) {
      return res.status(400).json({ msg: 'Supplier with this email already exists' });
    }

    const supplier = await Supplier.create({ name, contactPerson, email, phone, address });
    return res.status(201).json(supplier);
  } catch (err) {
    console.error('Add Supplier Error:', err.message);
    return res.status(500).send('Server Error');
  }
};

// GET /api/suppliers (Admin only)            //paddathiye inna okkama suppliers ganna eka
const getSuppliers = async (req, res) => {
  try { // ★ try-catch block 
    const suppliers = await Supplier.aggregate([
      { $match: {} },
      {
        $lookup: {
          from: 'preorders',      // make sure collection name is correct
          localField: '_id',
          foreignField: 'supplier',
          as: 'preorders'
        }
      },
      { $project: { name:1, email:1, phone:1, contactPerson:1, address:1, preorders: { $slice: ['$preorders', 20] } } },
      { $sort: { name: 1 } }
    ]);
    return res.json(suppliers);
  } catch(err) {
    console.error('Get Suppliers Error:', err.message);
    return res.status(500).send('Server Error');
  }
};

// PUT /api/suppliers/:id (Admin only)
const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!supplier) return res.status(404).json({ msg: 'Supplier not found' });
    return res.json(supplier);
  } catch (err) {
    console.error('Update Supplier Error:', err.message);
    return res.status(500).send('Server Error');
  }
};

// DELETE /api/suppliers/:id (Admin only)
const deleteSupplier = async (req, res) => {
  try {
    const existing = await Supplier.findById(req.params.id);
    if (!existing) return res.status(404).json({ msg: 'Supplier not found' });

    await Supplier.findByIdAndDelete(req.params.id);
    return res.json({ msg: 'Supplier removed successfully' });
  } catch (err) {
    console.error('Delete Supplier Error:', err.message);
    return res.status(500).send('Server Error');
  }
};

// GET /api/suppliers/all (Public)
const getAllSuppliers = async (_req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    return res.json(suppliers);
  } catch (err) {
    console.error('Public GetAll Suppliers Error:', err.message);
    return res.status(500).send('Server Error');
  }
};

//csv report eka hadana function eka

const generateSupplierCsvReport = async (req, res) => {
    try {
        const suppliers = await Supplier.find().sort({ name: 1 });

        if (suppliers.length === 0) {
            return res.status(404).json({ msg: 'No suppliers found to generate a report.' });
        }

        const fields = [
            { label: 'Supplier Name', value: 'name' },
            { label: 'Contact Person', value: 'contactPerson' },
            { label: 'Email Address', value: 'email' },
            { label: 'Phone Number', value: 'phone' },
            { label: 'Address', value: 'address' }
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


// ★★★ module.exports 
module.exports = {
  addSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
  getAllSuppliers,
  generateSupplierCsvReport
};
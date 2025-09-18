const Supplier = require('../models/Supplier'); // <-- match folder casing

// POST /api/suppliers  (Admin only)
const addSupplier = async (req, res) => {
  const { name, contactPerson, email, phone, address } = req.body;

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

// GET /api/suppliers (Admin only)
const getSuppliers = async (_req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    return res.json(suppliers);
  } catch (err) {
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

module.exports = {
  addSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
  getAllSuppliers,
};
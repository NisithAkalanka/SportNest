const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactPerson: { type: String },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String },
}, { timestamps: true }); // create and  update times

// ★★★ OverwriteModelError eka walakwnawa
module.exports = mongoose.models.Supplier || mongoose.model('Supplier', SupplierSchema);
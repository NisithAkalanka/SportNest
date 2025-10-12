const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactPerson: { type: String },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String },
  // 
  bankName: { type: String, trim: true },
  accountNumber: { type: String, trim: true },
  accountName: { type: String, trim: true },
}, { timestamps: true }); // createdAt 

// ★★★ OverwriteModelError eka walakwanawa
module.exports = mongoose.models.Supplier || mongoose.model('Supplier', SupplierSchema);
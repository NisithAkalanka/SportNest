const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactPerson: { type: String },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String },
  // ★★★ මෙන්න අලුතින් එකතු කළ fields ටික ★★★
  bankName: { type: String, trim: true },
  accountNumber: { type: String, trim: true },
  accountName: { type: String, trim: true },
}, { timestamps: true }); // createdAt සහ updatedAt එකතු කිරීම හොඳ පුරුද්දක්

// ★★★ OverwriteModelError එක වළක්වන, වඩාත් ආරක්ෂිත export ක්‍රමය ★★★
module.exports = mongoose.models.Supplier || mongoose.model('Supplier', SupplierSchema);
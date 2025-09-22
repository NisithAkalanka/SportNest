const mongoose = require('mongoose');

const PreorderSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ['requested','ordered','received'], default: 'requested' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }, // optional
}, { timestamps: true });

module.exports = mongoose.model('Preorder', PreorderSchema);
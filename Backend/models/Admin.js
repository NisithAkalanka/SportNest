const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // ekama email ekakma thiyenne kiyala ensure karanawa
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'admin' // default role eka 'admin' widiyata set karanawa
  }
}, { timestamps: true }); // createdAt සහ updatedAt fields 

// ★★★ OverwriteModel Error eka prevent karanna 
module.exports = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
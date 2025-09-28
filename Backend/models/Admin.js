const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // ekama email eken admins la dennek hdanna beh
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'admin' 
  }
}, { timestamps: true }); // createdAt සහ updatedAt fields 

// ★★★ OverwriteModelError eka walakwnawa
module.exports = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
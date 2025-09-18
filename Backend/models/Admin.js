const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // එකම email එකකින් admins ලා දෙන්නෙක් හදන්න බෑ
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'admin' // ★★★ මේ පේළිය අලුතින් එකතු කිරීම ඉතාම හොඳ පුරුද්දක් ★★★
  }
}, { timestamps: true }); // createdAt සහ updatedAt fields එකතු කරයි

// ★★★ OverwriteModelError එක වළක්වන, වඩාත් ආරක්ෂිත export ක්‍රමය ★★★
module.exports = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
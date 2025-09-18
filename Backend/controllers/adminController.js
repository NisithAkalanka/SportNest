// Backend/Controllers/adminController.js (සම්පූර්ණ, syntax error එක නිවැරදි කරන ලද කේතය)

const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const registerAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ msg: 'Admin with this email already exists' });
    }
    admin = new Admin({ email, password });
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);
    await admin.save();
    res.status(201).json({ msg: 'Admin registered successfully. Please proceed to login.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    let admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      id: admin.id,
      role: 'admin'
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
            _id: admin.id,
            email: admin.email,
            name: "Administrator",
            role: 'admin',
            token: token
        });
      }
    );
  // ★★★ මෙන්න නිවැරදි කරන ලද catch block එක ★★★
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
};
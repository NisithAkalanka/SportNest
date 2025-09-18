const mongoose = require('mongoose');
const memberController = require('../controllers/memberController');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

exports.someFunction = (req, res) => {
  // your code
};

module.exports = connectDB;

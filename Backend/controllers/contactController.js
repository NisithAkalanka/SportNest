// File: backend/controllers/contactController.js

const ContactMessage = require('../models/ContactMessage');

// @desc    අලුත් contact පණිවිඩයක් නිර්මාණය කිරීම
// @route   POST /api/contact
// @access  Public
exports.createContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // --- Backend Validation ---
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message fields are required.' });
    }

    if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address with lowercase letters.' });
    }

    const wordCount = message.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount > 50) {
      return res.status(400).json({ success: false, message: 'Message cannot exceed 50 words.' });
    }
    // --- End Validation ---

    const newMessage = await ContactMessage.create({
      name: name.trim(),
      email,
      subject: subject ? subject.trim() : 'Website Inquiry',
      message: message.trim(),
    });

    res.status(201).json({ success: true, message: 'Your message has been sent successfully!', data: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error, please try again.', error: error.message });
  }
};

// @desc    සියලුම contact පණිවිඩ ලබාගැනීම
// @route   GET /api/contact
// @access  Private (Admin)
exports.getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages.', error: error.message });
  }
};

// @desc    contact පණිවිඩයක් ඉවත් කිරීම
// @route   DELETE /api/contact/:id
// @access  Private (Admin)
exports.deleteContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }
    res.status(200).json({ success: true, message: 'Message deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete message.', error: error.message });
  }
};//original
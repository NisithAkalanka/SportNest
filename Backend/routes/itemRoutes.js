const express = require('express');
const router = express.Router();

const { 
  addItem, 
  getItems,
  updateItem, 
  deleteItem, 
  getShopItems,
  generateInventoryPdfReport
} = require('../controllers/itemController');

const protectAdmin = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware'); 




router.post('/', protectAdmin, upload.single('image'), addItem);

router.get('/', protectAdmin, getItems);


router.put('/:id', protectAdmin, upload.single('image'), updateItem);

router.delete('/:id', protectAdmin, deleteItem);

// ★ PDF Report Route ★
router.get('/report/pdf', protectAdmin, generateInventoryPdfReport);


// --- Public Route 
router.get('/shop', getShopItems);

module.exports = router;
// Backend/routes/itemRoutes.js (සම්පූර්ණ, නිවැරදි කරන ලද කේතය)

const express = require('express');
const router = express.Router();

// ★★★ ඔබගේ itemController.js එකට ගැලපෙන පරිදි functions නිවැරදිව import කිරීම ★★★
const { 
  addItem, 
  getItems,     // controller එකේ ඇති නියම නම
  updateItem, 
  deleteItem, 
  getShopItems 
} = require('../controllers/itemController');

// Admin ට පමණක් අවසර දීමට, අපි හදපු 'adminMiddleware' එක import කරගන්නවා
const protectAdmin = require('../middleware/adminMiddleware');


// --- Admin ට පමණක් අදාළ Routes ('protectAdmin' මගින් ආරක්ෂා කර ඇත) ---
router.post('/', protectAdmin, addItem);
router.get('/', protectAdmin, getItems); // ★ 'getAllItems' වෙනුවට 'getItems' ලෙස නිවැරදි කළා
router.put('/:id', protectAdmin, updateItem);
router.delete('/:id', protectAdmin, deleteItem);

// --- Public (ඕනෑම කෙනෙකුට පෙනෙන) Route එක ---
router.get('/shop', getShopItems);

module.exports = router;
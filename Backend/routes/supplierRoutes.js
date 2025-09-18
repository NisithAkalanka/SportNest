// Backend/routes/supplierRoutes.js (සම්පූර්ණ, නිවැරදි කරන ලද කේතය)

const express = require('express');
const router = express.Router();

// ★★★ ඔබගේ supplierController.js එකට ගැලපෙන පරිදි functions නිවැරදිව import කිරීම ★★★
const {
    addSupplier,
    getSuppliers,      // controller එකේ ඇති නියම නම
    updateSupplier,
    deleteSupplier,
    getAllSuppliers    // Public route එකට අදාළ function එක
} = require('../controllers/supplierController');

// Admin ට පමණක් අවසර දීමට, 'adminMiddleware' එක import කරගන්නවා
const protectAdmin = require('../middleware/adminMiddleware');


// --- Admin ට පමණක් අදාළ වන Supplier Routes (ආරක්ෂිතයි) ---
router.post('/', protectAdmin, addSupplier);
router.get('/', protectAdmin, getSuppliers); // ★ 'getAllSuppliers' වෙනුවට 'getSuppliers' ලෙස නිවැරදි කළා
router.put('/:id', protectAdmin, updateSupplier);
router.delete('/:id', protectAdmin, deleteSupplier);

// --- Public (ඕනෑම කෙනෙකුට පෙනෙන) Route එක ---
// ඔබේ controller එකේ "Public" ලෙස සඳහන් නිසා, මම මේකට ආරක්ෂාවක් යෙදුවේ නැහැ
router.get('/all', getAllSuppliers);

module.exports = router;
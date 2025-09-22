const express = require('express');
const router = express.Router();

// ★★★ CSV report function එකත් මෙතනට import කරගන්නවා ★★★
const {
    addSupplier,
    getSuppliers,
    updateSupplier,
    deleteSupplier,
    getAllSuppliers,
    generateSupplierCsvReport // <-- අලුතින් එකතු කළ කොටස
} = require('../controllers/supplierController');

// Admin ට පමණක් අවසර දීමට, 'adminMiddleware' එක import කරගන්නවා
const protectAdmin = require('../middleware/adminMiddleware');


// --- Admin ට පමණක් අදාළ වන Supplier Routes (ආරක්ෂිතයි) ---
router.post('/', protectAdmin, addSupplier);
router.get('/', protectAdmin, getSuppliers);
router.put('/:id', protectAdmin, updateSupplier);
router.delete('/:id', protectAdmin, deleteSupplier);

// ★★★ CSV Report එක සඳහා අලුත් Route එක (මේකත් Admin ට විතරයි) ★★★
router.get('/report/csv', protectAdmin, generateSupplierCsvReport);


// --- Public (ඕනෑම කෙනෙකුට පෙනෙන) Route එක ---
router.get('/all', getAllSuppliers);

module.exports = router;
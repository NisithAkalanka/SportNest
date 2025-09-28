const express = require('express');
const router = express.Router();

// ★★★ CSV report function eka import 
const {
    addSupplier,
    getSuppliers,
    updateSupplier,
    deleteSupplier,
    getAllSuppliers,
    generateSupplierCsvReport // 
} = require('../controllers/supplierController');

// Admin ta pamanak  'adminMiddleware' eka import 
const protectAdmin = require('../middleware/adminMiddleware');


// --- Admin ta pamanak Supplier Routes  ---
router.post('/', protectAdmin, addSupplier);
router.get('/', protectAdmin, getSuppliers);
router.put('/:id', protectAdmin, updateSupplier);
router.delete('/:id', protectAdmin, deleteSupplier);

// ★★★ CSV Report eka sadaha Route ) ★★★
router.get('/report/csv', protectAdmin, generateSupplierCsvReport);


// --- Public hemotama penawa eka Route 
router.get('/all', getAllSuppliers);

module.exports = router;
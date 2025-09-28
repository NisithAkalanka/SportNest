const express = require('express');
const router = express.Router();

// ★★★ CSV report function 
const {
    addSupplier,
    getSuppliers,
    updateSupplier,
    deleteSupplier,
    getAllSuppliers,
    generateSupplierCsvReport 
} = require('../controllers/supplierController');

// Admin ta pamanak awasara dima
const protectAdmin = require('../middleware/adminMiddleware');



router.post('/', protectAdmin, addSupplier);
router.get('/', protectAdmin, getSuppliers);
router.put('/:id', protectAdmin, updateSupplier);
router.delete('/:id', protectAdmin, deleteSupplier);

// ★★★ CSV Report eka sadaha Route 
router.get('/report/csv', protectAdmin, generateSupplierCsvReport);



router.get('/all', getAllSuppliers);

module.exports = router;
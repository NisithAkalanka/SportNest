const express = require('express');
const router = express.Router();


const { 
  createPreorder, 
  listPreorders, 
  updateStatus,
  generateMonthlyReport,
  updatePreorderQuantity, // <-- 
  deletePreorder          // <-- 
} = require('../controllers/preorderController');


router.get('/', listPreorders);
router.post('/', createPreorder);
router.put('/:id/status', updateStatus);
router.get('/report/monthly', generateMonthlyReport);



router.put('/:id', updatePreorderQuantity);



router.delete('/:id', deletePreorder);


module.exports = router;
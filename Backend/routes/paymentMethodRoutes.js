const express = require('express');
const router = express.Router();
const {
  getPaymentMethods,
  savePaymentMethod,
  updatePaymentMethod,
  setDefaultPaymentMethod,
  deletePaymentMethod
} = require('../controllers/paymentMethodController');
const auth = require('../middleware/authMiddleware');

// All routes require authentication
router.use(auth);

router.get('/methods', getPaymentMethods);
router.post('/methods', savePaymentMethod);
router.put('/methods/:methodId', updatePaymentMethod);
router.put('/methods/:methodId/default', setDefaultPaymentMethod);
router.delete('/methods/:methodId', deletePaymentMethod);

module.exports = router;







// Backend/routes/eventsReportRoutes.js
const router = require('express').Router();
const ctrl = require('../controllers/eventsReportController');

router.get('/summary', ctrl.getSummary);
router.get('/export/csv', ctrl.exportCSV);
router.get('/export/pdf', ctrl.exportPDF);

module.exports = router;

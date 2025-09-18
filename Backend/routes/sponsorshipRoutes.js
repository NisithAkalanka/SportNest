const express = require('express');
const router = express.Router();


const { 
    registerSponsorship, 
    getSponsorshipForEditing,
    updateSponsorship,
    deleteSponsorship 
} = require('../controllers/sponsorshipController');


// POST 
router.post('/', registerSponsorship);


// GET 
router.get('/:id', getSponsorshipForEditing);


// PUT
router.put('/:id', updateSponsorship);


// DELETE
router.delete('/:id', deleteSponsorship);

module.exports = router;

const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
 const { registerPlayer, getMyProfiles, updateMyProfile, deleteMyProfile } = require('../controllers/playerController'); // path එක 'controllers' ද 'Controllers' ද බලන්න


router.post('/register', protect, registerPlayer);


router.get('/my-profiles', protect, getMyProfiles); 


router.put('/profile/:id', protect, updateMyProfile);


router.delete('/profile/:id', protect, deleteMyProfile);

module.exports = router;

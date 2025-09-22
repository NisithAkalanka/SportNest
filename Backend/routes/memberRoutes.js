const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware'); 
const upload = require('../middleware/uploadMiddleware');
const {
    registerMember, loginMember, getMyUserProfile, updateMyUserProfile, deleteMyUserProfile,
    forgotPassword, resetPassword, getAllMembers, getMemberById, updateMember, deleteMember,
    subscribeToMembership, cancelMembership 
} = require('../controllers/memberController'); 


// --- PUBLIC ROUTES ---
router.post('/register', registerMember); 
router.post('/login', loginMember);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// --- PROTECTED ROUTES (Logged in user can access) ---
router.route('/my-profile')
    .get(protect, getMyUserProfile)
    .put(protect, upload.single('profileImage'), updateMyUserProfile)
    .delete(protect, deleteMyUserProfile);

// ★ Membership Subscription Route
router.post('/subscribe', protect, subscribeToMembership);

// ★ Membership Cancellation Route
router.delete('/membership', protect, cancelMembership);


// --- ADMIN ONLY ROUTES ---
router.route('/')
    .get(protect, getAllMembers) 
    .post(protect, registerMember); 

router.route('/:id')
    .get(protect, getMemberById)
    .put(protect, updateMember)
    .delete(protect, deleteMember);


module.exports = router;
// File: backend/routes/memberRoutes.js

const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware'); 
const upload = require('../middleware/uploadMiddleware');

const {
    registerMember,
    loginMember,
    getMyUserProfile,
    updateMyUserProfile,
    removeProfilePhoto,   // ✅ NEW IMPORT
    deleteMyUserProfile,
    forgotPassword,
    resetPassword,
    getAllMembers,
    getMemberById,
    updateMember,
    deleteMember,
    subscribeToMembership,
    cancelMembership,
    renewMembership,
    getMembershipPlans
} = require('../controllers/memberController'); 

// --- PUBLIC ROUTES (ඕනෑම කෙනෙකුට පිවිසිය හැකි මාර්ග) ---
router.post('/register', registerMember); 
router.post('/login', loginMember);

// ★★★ "Forgot Password" සඳහා POST මාර්ගය ★★★
router.post('/forgot-password', forgotPassword);

// ★★★ "Reset Password" සඳහා PATCH මාර්ගය ★★★
router.patch('/reset-password/:token', resetPassword);

// ★★★ PUBLIC ROUTE: Membership plans එක ලබාගැනීම (Login අවශ්‍ය නෑ) ★★★
router.get('/membership-plans', getMembershipPlans);

// --- PROTECTED ROUTES (ලොග් වූ අයට පමණක්) ---
router.route('/my-profile')
    .get(protect, getMyUserProfile)
    .put(protect, upload.single('profileImage'), updateMyUserProfile)
    .delete(protect, deleteMyUserProfile);

// ★★★ Profile Photo එක මකා දැමීම සඳහා නව Route එක ★★★
router.delete('/my-profile/photo', protect, removeProfilePhoto);

router.post('/subscribe', protect, subscribeToMembership);
router.delete('/membership', protect, cancelMembership);
router.post('/renew', protect, renewMembership);

// --- ADMIN ONLY ROUTES ---
router.route('/')
    .get(protect, getAllMembers) 
    .post(protect, registerMember); 

router.route('/:id')
    .get(protect, getMemberById)
    .put(protect, updateMember)
    .delete(protect, deleteMember);

module.exports = router;

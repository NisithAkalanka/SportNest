const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const protectAdmin = require('../middleware/adminMiddleware'); // ★ Admin middleware එකත් import කරගන්නවා
const upload = require('../middleware/uploadMiddleware');

const {
    registerMember,
    loginMember,
    getMyUserProfile,
    updateMyUserProfile,
    removeProfilePhoto,
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
    getMembershipPlans,
    processMembershipPayment
} = require('../controllers/memberController');

// --- PUBLIC ROUTES (ආරක්ෂාවක් නැති, ඕනෑම කෙනෙකුට පිවිසිය හැකි මාර්ග) ---

// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★ මෙන්න නිවැරදි කරන ලද වැදගත්ම කොටස ★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// Register වීම සඳහා protect middleware එකක් අවශ්‍ය නැහැ
router.post('/register', registerMember); 

router.post('/login', loginMember);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.get('/membership-plans', getMembershipPlans);

// --- PROTECTED ROUTES (ලොග් වූ සාමාන්‍ය member කෙනෙකුට පමණක්) ---
router.route('/my-profile')
    .get(protect, getMyUserProfile)
    .put(protect, upload.single('profileImage'), updateMyUserProfile)
    .delete(protect, deleteMyUserProfile);
router.delete('/my-profile/photo', protect, removeProfilePhoto);
router.post('/subscribe', protect, subscribeToMembership);

// ★ Membership Payment Route
router.post('/process-membership-payment', protect, processMembershipPayment);

// ★ Membership Cancellation Route
router.delete('/membership', protect, cancelMembership);
router.post('/renew', protect, renewMembership);

// --- ADMIN ONLY ROUTES (Admin කෙනෙකුට පමණක්) ---
// Admin කෙනෙක් විසින් සියලුම members ලා බැලීමට
router.route('/').get(protectAdmin, getAllMembers); 

// Admin කෙනෙක් විසින් එක් member කෙනෙක්ව බැලීමට, update කිරීමට, delete කිරීමට
router.route('/:id')
    .get(protectAdmin, getMemberById)
    .put(protectAdmin, updateMember)
    .delete(protectAdmin, deleteMember);

module.exports = router;//ayunis
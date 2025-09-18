const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware'); // protect middleware එක නිවැරදිව import කර ඇත

// ★★★ නිවැරදි කළ යුතුම තැන ★★★
// path එකේ folder නම 'Controllers' (Capital C) ලෙස නිවැරදි කර ඇත.
// ඔබගේ folder එකේ නම simple 'c' නම්, මෙය 'controllers' ලෙස නැවත වෙනස් කරන්න.
// 'createMember' වෙනුවට admin විසින් user කෙනෙක් register කරන නිසා 'registerMember' නැවත භාවිත කර ඇත.
const {
    registerMember,
    loginMember,
    getMyUserProfile,
    updateMyUserProfile,
    deleteMyUserProfile,
    forgotPassword,
    resetPassword,
    getAllMembers,
    getMemberById,
    updateMember,
    deleteMember
} = require('../controllers/memberController'); 


// --- PUBLIC ROUTES ---
// ඕනෑම කෙනෙකුට register වීමට
router.post('/register', registerMember); 
router.post('/login', loginMember);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// --- PROTECTED ROUTES (Logged in user can access) ---
router.route('/my-profile')
    .get(protect, getMyUserProfile)
    .put(protect, updateMyUserProfile)
    .delete(protect, deleteMyUserProfile);

// --- ADMIN ONLY ROUTES ---
// Admin විසින් සියලු members ලා බැලීම සහ manage කිරීම
router.route('/')
    .get(protect, getAllMembers)         // සාමාන්‍යයෙන් මේවාත් protect විය යුතුයි (admin role check එකක් සමග)
    .post(protect, registerMember);       // Admin විසින් member කෙනෙක් create කිරීමට, register function එකම පාවිච්චි කළ හැක

router.route('/:id')
    .get(protect, getMemberById)
    .put(protect, updateMember)
    .delete(protect, deleteMember);


module.exports = router;

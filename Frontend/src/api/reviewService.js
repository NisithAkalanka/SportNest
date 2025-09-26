import axios from 'axios';

const API_URL = '/api/reviews';

// ★★★ විසඳුම 1: Member ට සහ Admin ට වෙන් වෙන්ව token ලබාගන්නා ශ්‍රිත ★★★

// Member-only functions සඳහා token ලබාගන්නා ශ්‍රිතය
// මෙම ශ්‍රිතය 'userInfo' පමණක් සොයයි
const getMemberTokenConfig = () => {
    const memberInfoString = localStorage.getItem('userInfo'); 
    if (memberInfoString) {
        try {
            const memberInfo = JSON.parse(memberInfoString);
            if (memberInfo && memberInfo.token) {
                return { headers: { Authorization: `Bearer ${memberInfo.token}` } };
            }
        } catch (e) { console.error("Error parsing userInfo", e); }
    }
    // Member token එක නොමැතිනම්, කිසිවක් නොකරයි (error එකක් throw කරයි)
    return null;
};

// Admin-only functions සඳහා token ලබාගන්නා ශ්‍රිතය
// මෙම ශ්‍රිතය 'adminInfo' පමණක් සොයයි
const getAdminTokenConfig = () => {
    const adminInfoString = localStorage.getItem('adminInfo');
    if (adminInfoString) {
        try {
            const adminInfo = JSON.parse(adminInfoString);
            if (adminInfo && adminInfo.token) {
                return { headers: { Authorization: `Bearer ${adminInfo.token}` } };
            }
        } catch (e) { console.error("Error parsing adminInfo", e); }
    }
    // Admin token එක නොමැතිනම්, කිසිවක් නොකරයි
    return null;
};


// --- Public Functions ---
// (මෙහි වෙනසක් නැත)
export const getFeaturedReviews = async () => {
    const response = await axios.get(`${API_URL}/featured`);
    return response.data;
};


// --- Member Functions ---
// ★★★ විසඳුම 2: අදාළ ශ්‍රිත තුළ නිවැරදි token function එක call කිරීම ★★★

export const getMyReview = async () => {
    const config = getMemberTokenConfig(); // <-- 'getTokenConfig' වෙනුවට 'getMemberTokenConfig'
    if (!config) return null; // Token නැත්නම් null return කරයි
    const response = await axios.get(`${API_URL}/my-review`, config);
    return response.data;
};

export const createOrUpdateMyReview = async (reviewData) => {
    const config = getMemberTokenConfig(); // <-- 'getTokenConfig' වෙනුවට 'getMemberTokenConfig'
    if (!config) throw new Error('Not authorized. Please login as a member.');
    const response = await axios.post(`${API_URL}/my-review`, reviewData, config);
    return response.data;
};

export const deleteMyReview = async () => {
    const config = getMemberTokenConfig(); // <-- 'getTokenConfig' වෙනුවට 'getMemberTokenConfig'
    if (!config) throw new Error('Not authorized. Please login as a member.');
    const response = await axios.delete(`${API_URL}/my-review`, config);
    return response.data;
};


// --- Admin Functions ---
// (Admin functions සඳහා 'getAdminTokenConfig' භාවිතා කිරීම)
export const getAllReviewsForAdmin = async () => {
    const config = getAdminTokenConfig(); // <-- Admin සඳහා වෙන්වූ function එක
    if (!config) throw new Error('Not authorized as Admin.');
    const response = await axios.get(`${API_URL}/admin/all`, config);
    return response.data;
};

export const toggleFeaturedStatus = async (reviewId) => {
    const config = getAdminTokenConfig(); // <-- Admin සඳහා වෙන්වූ function එක
    if (!config) throw new Error('Not authorized as Admin.');
    const response = await axios.patch(`${API_URL}/admin/feature/${reviewId}`, {}, config);
    return response.data;
};


// Default export object for easier importing in components
const reviewService = {
    getFeaturedReviews,
    getMyReview,
    createOrUpdateMyReview,
    deleteMyReview,
    getAllReviewsForAdmin,
    toggleFeaturedStatus
};

export default reviewService;
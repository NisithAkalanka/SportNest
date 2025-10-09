import axios from 'axios';

const API_URL = '/api/reviews';

// solution 1: Member ta saha Admin ta wen wenwa token lbagnna shritha

// Member-only functions sdha token lbgnna shrithya
// mein 'userInfo' pmnak soyai
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
    // Member token eka noathinm, kisiwak karanne na (error ekak throw krai)
    return null;
};

// Admin-only functions sadaha token ganna shrithaya
// meya 'adminInfo' witharak hoyai
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
    // Admin token eka nattam kisiwak nokarai.
    return null;
};


// --- Public Functions ---

export const getFeaturedReviews = async () => {
    const response = await axios.get(`${API_URL}/featured`);
    return response.data;
};


// --- Member Functions ---
// solution 2: adala shritha thula niwaradi token function eka call kirima

export const getMyReview = async () => {
    const config = getMemberTokenConfig(); // <-- 'getTokenConfig' wenuwta 'getMemberTokenConfig'
    if (!config) return null; // Token naththam null return karai
    const response = await axios.get(`${API_URL}/my-review`, config);
    return response.data;
};

export const createOrUpdateMyReview = async (reviewData) => {
    const config = getMemberTokenConfig(); // <-- 'getTokenConfig' wenuwta 'getMemberTokenConfig'
    if (!config) throw new Error('Not authorized. Please login as a member.');
    const response = await axios.post(`${API_URL}/my-review`, reviewData, config);
    return response.data;
};

export const deleteMyReview = async () => {
    const config = getMemberTokenConfig(); // <-- 'getTokenConfig' wenuwata 'getMemberTokenConfig'
    if (!config) throw new Error('Not authorized. Please login as a member.');
    const response = await axios.delete(`${API_URL}/my-review`, config);
    return response.data;
};


// --- Admin Functions ---
// (Admin functions sadaha 'getAdminTokenConfig' use kirima)
export const getAllReviewsForAdmin = async () => {
    const config = getAdminTokenConfig(); // <-- Admin sdha wenwu function eka
    if (!config) throw new Error('Not authorized as Admin.');
    const response = await axios.get(`${API_URL}/admin/all`, config);
    return response.data;
};

export const toggleFeaturedStatus = async (reviewId) => {
    const config = getAdminTokenConfig(); // <-- Admin sdha wenwu function eka
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
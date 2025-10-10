// ===============================================
// File: Frontend/src/api/reviewService.js
// ===============================================

import axios from 'axios';

const API_URL = '/api/reviews';

// --------------------------------------------------
// --- TOKEN CONFIG FUNCTIONS ---
// --------------------------------------------------

// Member-only functions sdh token lbgnima
// mein 'userInfo' pmnak soyai
const getMemberTokenConfig = () => {
    const memberInfoString = localStorage.getItem('userInfo'); 
    if (memberInfoString) {
        try {
            const memberInfo = JSON.parse(memberInfoString);
            if (memberInfo && memberInfo.token) {
                return { headers: { Authorization: `Bearer ${memberInfo.token}` } };
            }
        } catch (e) {
            console.error("Error parsing userInfo", e);
        }
    }
    // Member token eka noathinm, kisiwak karanne na (error ekak throw krai)
    return null;
};

// Admin-only functions සඳහා token lbgnima
// meya 'adminInfo' witharak hoyai
const getAdminTokenConfig = () => {
    const adminInfoString = localStorage.getItem('adminInfo');
    if (adminInfoString) {
        try {
            const adminInfo = JSON.parse(adminInfoString);
            if (adminInfo && adminInfo.token) {
                return { headers: { Authorization: `Bearer ${adminInfo.token}` } };
            }
        } catch (e) {
            console.error("Error parsing adminInfo", e);
        }
    }
    // Admin token eka nattam kisiwak nokarai.
    return null;
};

// --------------------------------------------------
// --- PUBLIC FUNCTIONS ---
// --------------------------------------------------

export const getFeaturedReviews = async () => {
    const response = await axios.get(`${API_URL}/featured`);
    return response.data;
};

// --------------------------------------------------
// --- MEMBER FUNCTIONS ---
// --------------------------------------------------

export const getMyReview = async () => {
    const config = getMemberTokenConfig();
    if (!config) return null; // Token naththam null return karai
    const response = await axios.get(`${API_URL}/my-review`, config);
    return response.data;
};

export const createOrUpdateMyReview = async (reviewData) => {
    const config = getMemberTokenConfig();
    if (!config) throw new Error('Not authorized. Please login as a member.');
    const response = await axios.post(`${API_URL}/my-review`, reviewData, config);
    return response.data;
};

export const deleteMyReview = async () => {
    const config = getMemberTokenConfig();
    if (!config) throw new Error('Not authorized. Please login as a member.');
    const response = await axios.delete(`${API_URL}/my-review`, config);
    return response.data;
};

// --------------------------------------------------
// --- ADMIN FUNCTIONS ---
// --------------------------------------------------

export const getAllReviewsForAdmin = async () => {
    const config = getAdminTokenConfig();
    if (!config) throw new Error('Not authorized as Admin.');
    const response = await axios.get(`${API_URL}/admin/all`, config);
    return response.data;
};

export const toggleFeaturedStatus = async (reviewId) => {
    const config = getAdminTokenConfig();
    if (!config) throw new Error('Not authorized as Admin.');
    const response = await axios.patch(`${API_URL}/admin/feature/${reviewId}`, {}, config);
    return response.data;
};

// <<< NEW: Admin t review ekk delete kirimt function ek >>>
export const deleteReviewByAdmin = async (reviewId) => {
    const config = getAdminTokenConfig(); // Admin token ek lbgnima
    if (!config) throw new Error('Not authorized as Admin.');
    
    // Backend eke saduu nawa route ekt DELETE illimak yai
    const response = await axios.delete(`${API_URL}/admin/delete/${reviewId}`, config);
    return response.data;
};

// --------------------------------------------------
// --- DEFAULT EXPORT (ALL FUNCTIONS) ---
// --------------------------------------------------

const reviewService = {
    getFeaturedReviews,
    getMyReview,
    createOrUpdateMyReview,
    deleteMyReview,
    getAllReviewsForAdmin,
    toggleFeaturedStatus,
    deleteReviewByAdmin // <<< NEW
};

export default reviewService;

// Frontend/src/api/attendanceService.js

import axios from 'axios';

const API_URL = '/api/attendance';

const getConfig = () => {
    let activeUserStorage = localStorage.getItem('adminInfo') || localStorage.getItem('userInfo');
    if (activeUserStorage) {
        const parsedInfo = JSON.parse(activeUserStorage);
        const token = parsedInfo.token;
        if (token) {
            return { headers: { Authorization: `Bearer ${token}` } };
        }
    }
    console.error("Auth Token not found from 'adminInfo' or 'userInfo' keys.");
    return {};
}

// --- Coach Services ---
export const submitCoachAttendance = async (attendanceData) => {
    const response = await axios.post(`${API_URL}/coach`, attendanceData, getConfig());
    return response.data;
};
export const getMyAttendance = async () => {
    const response = await axios.get(`${API_URL}/coach`, getConfig());
    return response.data;
};
export const updateMyAttendance = async (id, attendanceData) => {
    const response = await axios.put(`${API_URL}/coach/${id}`, attendanceData, getConfig());
    return response.data;
};
export const deleteMyAttendance = async (id) => {
    const response = await axios.delete(`${API_URL}/coach/${id}`, getConfig());
    return response.data;
};

// --- Admin Services ---
export const getPendingForAdmin = async () => {
    const response = await axios.get(`${API_URL}/admin/pending`, getConfig());
    return response.data;
};
export const getAllAttendanceForAdmin = async () => {
    const response = await axios.get(`${API_URL}/admin/all`, getConfig());
    return response.data;
};
export const updateStatusByAdmin = async (id, status) => {
    const response = await axios.put(`${API_URL}/admin/update/${id}`, { status }, getConfig());
    return response.data;
};
export const deleteAttendanceByAdmin = async (id) => {
    const response = await axios.delete(`${API_URL}/admin/delete/${id}`, getConfig());
    return response.data;
};

// Admint smpurna vhayawak athulth krima
//  update kirma
export const updateRecordByAdmin = async (id, fullData) => {
    const response = await axios.put(`${API_URL}/admin/full-update/${id}`, fullData, getConfig());
    return response.data;
};
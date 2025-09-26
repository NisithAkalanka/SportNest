// File: Frontend/src/api/coachService.js

import axios from 'axios';

const API_URL = '/api/coaches';

// සියලුම coaches ලාගේ දත්ත ලබා ගැනීම
export const getCoachesData = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// Coach ගේ salary එක update කිරීම (Route එක backend එකට ගැලපෙන ලෙස වෙනස් කර ඇත)
export const updateSalary = async (coachId, baseSalary) => {
    const response = await axios.put(`${API_URL}/${coachId}/salary`, { baseSalary });
    return response.data;
};

// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★ අලුතින් එකතු කළ Salary Delete කිරීමේ API Function එක ★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
export const deleteSalary = async (coachId) => {
    const response = await axios.delete(`${API_URL}/${coachId}/salary`);
    return response.data;
};
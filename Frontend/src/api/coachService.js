// File: Frontend/src/api/coachService.js

import axios from 'axios';

const API_URL = '/api/coaches';

//siyaluma coacheslge data laganima
export const getCoachesData = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// Coach lge salary ek update kirima (Route ek backend ekta glpena lesa wens kraa)
export const updateSalary = async (coachId, baseSalary) => {
    const response = await axios.put(`${API_URL}/${coachId}/salary`, { baseSalary });
    return response.data;
};


// Aluthin ekathu kala Salary Delete kirime API Function ek

export const deleteSalary = async (coachId) => {
    const response = await axios.delete(`${API_URL}/${coachId}/salary`);
    return response.data;
};
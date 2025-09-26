import axios from 'axios';

const API_URL = '/api/salaries'; //  backend route 

/**
 * Salary report ek generate kirimata backend ekt request ywnaw
 * @param {number} year - year (e.g., 2025)
 * @param {number} month - month (1 - 12 dakwa)
 * @returns {Promise<Object>} - Salary report dnna
 */
export const generateReport = async (year, month) => {
    const response = await axios.post(`${API_URL}/report`, { year, month });
    return response.data;
};
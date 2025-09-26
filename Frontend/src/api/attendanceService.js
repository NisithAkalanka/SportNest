import axios from 'axios';

const API_URL = '/api/attendance'; // අපගේ backend route එක

// සියලුම coaches ලා ලබාගැනීම
export const getCoaches = async () => {
    const response = await axios.get(`${API_URL}/coaches`);
    return response.data;
};

// Attendance history එක ලබාගැනීම
export const getAttendance = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// Attendance එකක් සටහන් කිරීම / යාවත්කාලීන කිරීම
export const markAttendance = async (attendanceData) => {
    const response = await axios.post(API_URL, attendanceData);
    return response.data;
};

// Attendance එකක් මකා දැමීම
export const deleteAttendance = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};
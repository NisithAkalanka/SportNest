import axios from 'axios';

const API_URL = '/api/attendance'; // apge backend route ek

//serma coaches la laba ganima
export const getCoaches = async () => {
    const response = await axios.get(`${API_URL}/coaches`);
    return response.data;
};

// Attendance history ek labagnima
export const getAttendance = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// Attendance ekk satahan kirima / update kirima
export const markAttendance = async (attendanceData) => {
    const response = await axios.post(API_URL, attendanceData);
    return response.data;
};

// Attendance dlte kirima
export const deleteAttendance = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};
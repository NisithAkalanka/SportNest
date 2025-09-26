// File: frontend/src/api/axiosConfig.js
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
    // ★★★ local storage key එක 'userInfo' බවට වග බලා ගන්න ★★★
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.token) {
        config.headers['Authorization'] = `Bearer ${userInfo.token}`;
    }
    return config;
}, (error) => Promise.reject(error));

export default api;
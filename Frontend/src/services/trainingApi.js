// File: Frontend/src/services/trainingApi.js
import axios from 'axios';

const API_URL = 'http://localhost:5002/api/trainings';

const getToken = () => {
  const userInfoString = localStorage.getItem('userInfo');
  if (userInfoString) {
    const userInfo = JSON.parse(userInfoString);
    return userInfo.token || null;
  }
  return null;
};

const config = () => ({
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  },
});

// --- Coach APIs ---
const createTraining = async (trainingData) => {
  const { data } = await axios.post(API_URL, trainingData, config());
  return data;
};

const getMySessions = async () => {
  const { data } = await axios.get(`${API_URL}/mysessions`, config());
  return data;
};

const updateSession = async (id, trainingData) => {
  const { data } = await axios.put(`${API_URL}/${id}`, trainingData, config());
  return data;
};

const deleteSession = async (id) => {
  await axios.delete(`${API_URL}/${id}`, config());
};

//  Public APIs (Players/Members) ---
const getAllSessions = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};

// --- Player Registration APIs ---
const registerSession = async (id) => {
  const { data } = await axios.post(`${API_URL}/${id}/register`, {}, config());
  return data;
};

const unregisterSession = async (id) => {
  const { data } = await axios.post(`${API_URL}/${id}/unregister`, {}, config());
  return data;
};

const trainingApi = {
  createTraining,
  getAllSessions,
  getMySessions,
  updateSession,
  deleteSession,
  registerSession,     
  unregisterSession,   
};

export default trainingApi;

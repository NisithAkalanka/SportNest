import axios from "axios";
const API = import.meta.env.VITE_API_BASE || "http://localhost:5002";

/* ------------ Auth helpers ------------ */
const getToken = () => {
  try {
    const ai = JSON.parse(localStorage.getItem("adminInfo"));
    if (ai?.token) return ai.token;
    const ui = JSON.parse(localStorage.getItem("userInfo"));
    return ui?.token || null;
  } catch {
    return null;
  }
};
const authHeader = () => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

/* ------------ Public ------------ */
export const listApproved  = (params) => axios.get(`${API}/api/events/approved`, { params });
export const getEvent      = (id)     => axios.get(`${API}/api/events/${id}`);
export const registerEvent = (id, data) =>
  axios.post(`${API}/api/events/${id}/register`, data);

/* ------------ Protected (member/admin) ------------ */
export const submitEvent   = (data)   =>
  axios.post(`${API}/api/events/submit`, data, { headers: authHeader() });

export const listMine      = ()       =>
  axios.get(`${API}/api/events/mine`, { headers: authHeader() });

export const listEvents    = (params) =>
  axios.get(`${API}/api/events`, { params, headers: authHeader() });

export const approveEvent  = (id)     =>
  axios.patch(`${API}/api/events/${id}/approve`, null, { headers: authHeader() });

export const rejectEvent   = (id)     =>
  axios.patch(`${API}/api/events/${id}/reject`,  null, { headers: authHeader() });

export const updateEvent   = (id, data) =>
  axios.put(`${API}/api/events/${id}`, data, { headers: authHeader() });

export const deleteEvent   = (id) =>
  axios.delete(`${API}/api/events/${id}`, { headers: authHeader() });

/* ------------ Reports ------------ */
export const getEventsReport = (params) =>
  axios.get(`${API}/api/events/report/summary`, { params, headers: authHeader() });

//  Use arraybuffer here
export const downloadEventsCSV = (params) =>
  axios.get(`${API}/api/events/report/export/csv`, {
    params,
    responseType: "arraybuffer",
    headers: authHeader(),
  });

export const downloadEventsPDF = (params) =>
  axios.get(`${API}/api/events/report/export/pdf`, {
    params,
    responseType: "arraybuffer",
    headers: authHeader(),
  });

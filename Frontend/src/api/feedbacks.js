import axios from "axios";
import api from '@/api';
const API  = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || "/api" });
const auth = (t) => ({ headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` } });


export const createCoachFeedback = (payload, token) =>
  API.post("/feedbacks/coach", payload, auth(token)).then(r => r.data);

export const listCoachFeedbacks = (token) =>
  API.get("/feedbacks/coach/mine", auth(token)).then(r => r.data);

export const updateFeedback = (id, payload, token) =>
  API.patch(`/feedbacks/${id}`, payload, auth(token)).then(r => r.data);

export const deleteFeedback = (id, token) =>
  API.delete(`/feedbacks/${id}`, auth(token)).then(r => r.data);

// Add this function to the bottom of frontend/src/api/feedbacks.js

/**
 * Fetches the feedback summary statistics for the logged-in coach.
 * Calls the GET /api/feedbacks/coach/summary endpoint.
 */
export const getCoachFeedbackSummary = (token) => {
  // The Axios interceptor in api.js will automatically attach the token.
  return api.get('/feedbacks/coach/summary');
};

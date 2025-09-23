import axios from "axios";
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

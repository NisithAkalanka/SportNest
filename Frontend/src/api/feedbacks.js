import api from '@/api';

// Optional auth helper – attaches Authorization header if a token is provided
const withAuth = (t) => (t ? { headers: { Authorization: `Bearer ${t}` } } : undefined);

export const createCoachFeedback = (payload, token) =>
  api.post('/feedbacks/coach', payload, withAuth(token)).then((r) => r.data);

export const listCoachFeedbacks = (token) =>
  api.get('/feedbacks/coach/mine', withAuth(token)).then((r) => r.data);

export const updateFeedback = (id, payload, token) =>
  api.patch(`/feedbacks/${id}`, payload, withAuth(token)).then((r) => r.data);

export const deleteFeedback = (id, token) =>
  api.delete(`/feedbacks/${id}`, withAuth(token)).then((r) => r.data);

/**
 * Fetches the feedback summary statistics for the logged-in coach.
 * GET /feedbacks/coach/summary
 */
export const getCoachFeedbackSummary = (token) =>
  api.get('/feedbacks/coach/summary', withAuth(token));

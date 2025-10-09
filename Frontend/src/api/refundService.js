import api from './axiosConfig';

// Refund API service functions
export const refundService = {
  // Request a refund
  requestRefund: async (refundData) => {
    const response = await api.post('/refunds/request', refundData);
    return response.data;
  },

  // Get user's refund requests
  getMyRefunds: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/refunds/my-refunds?${queryParams}`);
    return response.data;
  },

  // Get refund by ID
  getRefundById: async (refundId) => {
    const response = await api.get(`/refunds/${refundId}`);
    return response.data;
  },

  // Admin: Get all refunds
  getAllRefunds: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/refunds?${queryParams}`);
    return response.data;
  },

  // Admin: Approve refund
  approveRefund: async (refundId, adminNotes) => {
    const response = await api.put(`/refunds/${refundId}/approve`, { adminNotes });
    return response.data;
  },

  // Admin: Reject refund
  rejectRefund: async (refundId, adminNotes) => {
    const response = await api.put(`/refunds/${refundId}/reject`, { adminNotes });
    return response.data;
  },

  // Admin: Complete refund
  completeRefund: async (refundId) => {
    const response = await api.put(`/refunds/${refundId}/complete`);
    return response.data;
  },

  // Admin: Get refund statistics
  getRefundStats: async () => {
    const response = await api.get('/refunds/stats/summary');
    return response.data;
  }
};

export default refundService;

import api from '../api';

// Driver API service for backend communication
export const driverApi = {
  // Get all drivers with search, filter, and pagination
  getDrivers: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.status && params.status !== 'All Status') queryParams.append('status', params.status);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const response = await api.get(`/drivers?${queryParams.toString()}`);
    return response.data;
  },

  // Get driver by ID
  getDriverById: async (id) => {
    const response = await api.get(`/drivers/${id}`);
    return response.data;
  },

  // Create new driver
  createDriver: async (driverData) => {
    const formData = new FormData();
    
    // Append all driver fields
    Object.keys(driverData).forEach(key => {
      if (driverData[key] !== null && driverData[key] !== undefined) {
        if (key === 'emergencyContact' && typeof driverData[key] === 'object') {
          formData.append('emergencyContact', JSON.stringify(driverData[key]));
        } else if (key === 'profileImage' && driverData[key] instanceof File) {
          formData.append('profileImage', driverData[key]);
        } else {
          formData.append(key, driverData[key]);
        }
      }
    });

    const response = await api.post('/drivers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update driver
  updateDriver: async (id, driverData) => {
    const formData = new FormData();
    
    // Append all driver fields
    Object.keys(driverData).forEach(key => {
      if (driverData[key] !== null && driverData[key] !== undefined) {
        if (key === 'emergencyContact' && typeof driverData[key] === 'object') {
          formData.append('emergencyContact', JSON.stringify(driverData[key]));
        } else if (key === 'profileImage' && driverData[key] instanceof File) {
          formData.append('profileImage', driverData[key]);
        } else {
          formData.append(key, driverData[key]);
        }
      }
    });

    const response = await api.put(`/drivers/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete driver
  deleteDriver: async (id) => {
    const response = await api.delete(`/drivers/${id}`);
    return response.data;
  },

  // Get driver statistics
  getDriverStats: async () => {
    const response = await api.get('/drivers/stats');
    return response.data;
  },

  // Export drivers to PDF
  exportDriversToPDF: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.status && params.status !== 'All Status') queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);

    const response = await api.get(`/drivers/export/pdf?${queryParams.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Bulk update driver status
  bulkUpdateStatus: async (driverIds, status) => {
    const response = await api.patch('/drivers/bulk/status', {
      driverIds,
      status,
    });
    return response.data;
  },

  // Bulk delete drivers
  bulkDeleteDrivers: async (driverIds) => {
    const response = await api.delete('/drivers/bulk/delete', {
      data: { driverIds },
    });
    return response.data;
  },
};

export default driverApi;

api.interceptors.request.use((config) => {
  const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
  const token = adminInfo?.token;
  console.log('DEBUG: auth token =', token);
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
}, (err) => Promise.reject(err));
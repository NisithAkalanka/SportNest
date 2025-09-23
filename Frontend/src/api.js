import axios from 'axios';

// baseURL එක '/api' ලෙස යෙදීමෙන්, Vite proxy එක ක්‍රියාත්මක වේ
const api = axios.create({
  baseURL: 'http://localhost:5002/api',
});

// Interceptor: Request එකක් Backend එකට යන්න කලින් මැදට පැනීම
api.interceptors.request.use(
  (config) => {
    
    // ★★★ Admin ද Member ද කියා බලා, නිවැරදි Token එක තෝරාගැනීම ★★★

    // 1. මුලින්ම localStorage එකෙන් Admin ගේ විස්තර ('adminInfo') හොයනවා
    let userInfo = JSON.parse(localStorage.getItem('adminInfo'));
    let token;

    // 2. Admin ගේ විස්තර සහ token එක තියෙනවා නම්, ඒක token variable එකට දාගන්නවා
    if (userInfo && userInfo.token) {
      token = userInfo.token;
    } else {
      // 3. Admin කෙනෙක් නැත්නම්, Member ගේ විස්තර ('userInfo') හොයනවා
      userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo && userInfo.token) {
        token = userInfo.token;
      }
    }

    // 4. අවසානයේදී, token එකක් හොයාගත්තා නම්...
    if (token) {
      // ...ඒක Authorization header එකට 'Bearer' සමග එකතු කරලා යවනවා
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 5. සකස් කළ request එක ආපසු යවනවා
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
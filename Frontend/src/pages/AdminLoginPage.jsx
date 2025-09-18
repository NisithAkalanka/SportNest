// src/pages/AdminLoginPage.jsx (සම්පූර්ණ, UI එක වැඩිදියුණු කරන ලද කේතය)

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AdminAuthContext } from '@/context/AdminAuthContext';

// ★★★ Shadcn/UI components ටික import කරගන්නවා ★★★
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { admin, loginAdmin } = useContext(AdminAuthContext);

  useEffect(() => {
    if (admin) {
      navigate('/admin-dashboard');
    }
  }, [admin, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/admin/login', { email, password });
      loginAdmin(data);
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ★★★ UI එක, Member Login එකට සමානව සකස් කර ඇත ★★★
    <div className="flex items-center justify-center min-h-screen p-6" style={{backgroundColor: '#F8F9FA'}}>
      <form onSubmit={handleLogin} className="bg-white p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-sm border">
          <h2 className="text-3xl font-bold mb-8 text-center" style={{color: '#0D1B2A'}}>Admin Portal</h2>
          
          {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">{error}</div>}
          
          <div className="mb-6 space-y-2">
              <Label htmlFor="admin-email">Email Address</Label>
              <Input 
                id="admin-email"
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="admin@example.com"
              />
          </div>
          
          <div className="mb-6 space-y-2">
               <Label htmlFor="admin-password">Password</Label>
              <Input 
                id="admin-password"
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
                placeholder="••••••••"
              />
          </div>
          
          {/* ★★★ Login Button එක මෙන්න ★★★ */}
          <Button type="submit" disabled={loading} className="w-full text-white font-bold py-3" style={{backgroundColor: '#0D1B2A'}}>
              {loading ? 'Signing In...' : 'Sign In as Admin'}
          </Button>
      </form>
    </div>
  );
};

export default AdminLoginPage;
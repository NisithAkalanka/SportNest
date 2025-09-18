import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom";

// ★★★ වැදගත්: '../context/MemberAuthContext' file එකෙන් 'AuthContext' කියන එක import කරනවා ★★★
import { AuthContext } from '../context/MemberAuthContext'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MemberLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    
    // ★★★ නිවැරදි කරන ලද කොටස: useContext hook එකට 'AuthContext' කියන නම ලබා දෙනවා ★★★
    const { user, login } = useContext(AuthContext);

    // Login වුණු user කෙනෙක් මේ පිටුවට ආවොත්, එයාව member-dashboard එකට හරවනවා
    useEffect(() => {
        if (user) {
            navigate('/member-dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // API request එක Member Login endpoint එකට යවනවා
            const config = { headers: { 'Content-Type': 'application/json' } };
            const { data } = await axios.post('/api/members/login', { email, password }, config);
            
            // Member ගේ login function එක call කරලා 'userInfo' key එක යටතේ දත්ත ගබඩා කරනවා
            login(data);

            navigate('/member-dashboard');

        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-6" style={{backgroundColor: '#F8F9FA'}}>
            <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-md border">
                <h2 className="text-3xl font-bold mb-8 text-center" style={{color: '#0D1B2A'}}>Welcome Back!</h2>
                
                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">{error}</div>}
                
                <div className="mb-6">
                    <Label htmlFor="member-email">Email Address</Label>
                    <Input id="member-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                
                <div className="mb-6">
                     <Label htmlFor="member-password">Password</Label>
                    <Input id="member-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                
                <Button type="submit" disabled={loading} className="w-full text-white font-bold py-3" style={{backgroundColor: '#FF6700'}}>
                    {loading ? 'Signing In...' : 'Sign In'}
                </Button>

                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium hover:underline" style={{color: '#0D1B2A'}}>
                            Register here
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default MemberLoginPage;
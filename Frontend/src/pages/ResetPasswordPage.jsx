import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';

const ResetPasswordPage = () => {
    // URL  :get token 
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setMessage({ type: 'error', text: 'Passwords do not match.' });
        }
        if (password.length < 8) {
            return setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
        }

        setLoading(true);
        setMessage('');

        try {
            // Backend ekata token eka and new passsword yawima
            await axios.patch(`/api/members/reset-password/${token}`, { password });
            setMessage({ type: 'success', text: 'Password reset successful! Redirecting to login...' });
            
            // 2sec login pituwata yomu wima
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Invalid or expired token. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-800">Reset Your Password</h2>
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {message && (
                        <div className={`p-3 rounded-md text-center ${
                            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {message.text}
                        </div>
                    )}
                    
                    {!message || message.type !== 'success' ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full py-2 px-4 rounded-md font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center mt-4">
                           <Link to="/login" className="font-medium text-orange-600 hover:text-orange-500">
                                Go to Login
                            </Link>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
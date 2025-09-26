import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            // ★★★ Backend එකේ ඇති නිවැරදි ලිපිනයට දත්ත යැවීම ★★★
            const { data } = await axios.post('/api/members/forgot-password', { email });
            setMessage({ type: 'success', text: data.message });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Something went wrong. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-800">Forgot Password</h2>
                <p className="text-center text-sm text-gray-600 mt-2">
                    Enter the email address associated with your account and we'll send you a link to reset your password.
                </p>
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
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                                    placeholder="you@example.com"
                                />
                            </div>
                            <div>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full py-2 px-4 rounded-md font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
                                >
                                    {loading ? 'Sending...' : 'Send Reset Link'}
                                </button>
                            </div>
                        </>
                    ) : null}

                     <div className="text-sm text-center mt-4">
                        <Link to="/login" className="font-medium text-orange-600 hover:text-orange-500">
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
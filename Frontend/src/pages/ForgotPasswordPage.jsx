import React, { useState } from 'react';
import axios from 'axios';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const config = { headers: { "Content-Type": "application/json" } };
            const { data } = await axios.post('/api/members/forgotPassword', { email }, config);
            setMessage(data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'දෝෂයක් ඇතිවිය');
        }
    };

    return (
        <div className="flex justify-center items-center mt-20">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Forgot your password?</h2>
                <p className="text-center text-gray-600 mb-6">Don't worry. Enter your email address and we'll send you a reset link.</p>
                {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>}
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
                
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email Address</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" placeholder="youremail@example.com"/>
                </div>
                
                <button type="submit" className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600">
                    Send a Reset Link
                </button>
            </form>
        </div>
    );
};

export default ForgotPasswordPage;
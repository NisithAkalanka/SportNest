import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { token } = useParams(); // URL get token 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('The two passwords must be the same!');
        }
        setError('');
        setMessage('');

        try {
            const config = { headers: { "Content-Type": "application/json" } };
            const { data } = await axios.patch(`/api/members/resetPassword/${token}`, { password }, config);
            setMessage(`${data.message} You will be redirected to the Login page in a few seconds..`);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
             setError(err.response?.data?.message || 'An error occurred');
        }
    };

    return (
         <div className="flex justify-center items-center mt-20">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">create new password</h2>
                {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>}
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

                <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-700 font-bold mb-2">new password</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field" placeholder="••••••••"/>
                </div>
                <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-gray-700 font-bold mb-2">Confirm password</label>
                    <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="input-field" placeholder="••••••••"/>
                </div>

                <button type="submit" className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600">
                    change password
                </button>
            </form>
        </div>
    )
};
export default ResetPasswordPage;
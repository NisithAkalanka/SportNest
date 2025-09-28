import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RegisterForm() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        gender: 'Male',
        age: '',
        nic: '',
        email: '',
        role: 'Member',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        //  THIS IS THE UPDATED LOGIC BLOCK 
        try {
            const config = { headers: { 'Content-Type': 'application/json' } };
            const { data } = await axios.post('/api/members/register', formData, config);
            
            // Step 1: Save the entire user object (including token) to browser's local storage
            localStorage.setItem('userInfo', JSON.stringify(data));
            
            // Step 2: Set a success message
            setSuccess('Registration successful! Redirecting to your dashboard...');
            
            // Step 3: Redirect to the dashboard after 2 seconds
            setTimeout(() => navigate('/dashboard'), 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-3xl border border-gray-200">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Create Your Account</h2>
            
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 text-center">{error}</div>}
            {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-6 text-center font-semibold">{success}</div>}

            {/* The rest of your beautiful form JSX (no changes here) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                    <input id="firstName" name="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} required className="input-field" />
                </div>
                <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                    <input id="lastName" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} required className="input-field" />
                </div>
                
                <div>
                    <label htmlFor="nic" className="block text-sm font-medium text-gray-600 mb-1">NIC Number</label>
                    <input id="nic" name="nic" placeholder="987654321V" value={formData.nic} onChange={handleChange} required className="input-field" />
                </div>
                <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-600 mb-1">Age</label>
                    <input id="age" name="age" type="number" placeholder="25" value={formData.age} onChange={handleChange} required className="input-field" />
                </div>
                <div>
                     <label htmlFor="gender" className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
                    <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="input-field">
                        <option>Male</option>
                        <option>Female</option>
                    </select>
                </div>
                
                 <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                    <select id="role" name="role" value={formData.role} onChange={handleChange} className="input-field">
                        <option>Member</option>
                        <option>Coach</option>
                        <option>Player</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                    <input id="email" name="email" type="email" placeholder="john.doe@example.com" value={formData.email} onChange={handleChange} required className="input-field" />
                </div>
                <div className="md:col-span-2">
                     <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                    <input id="password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required className="input-field" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600 mb-1">Confirm Password</label>
                    <input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required className="input-field" />
                </div>
            </div>

            <button type="submit" className="w-full mt-8 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 duration-300">
                Register
            </button>
        </form>
    );
}

export default RegisterForm;
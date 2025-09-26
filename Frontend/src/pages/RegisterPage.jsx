// src/pages/RegisterPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/MemberAuthContext';
import api from '../api';

// NIC එකෙන් වයස ගණනය කරන function එක
const calculateAgeFromNIC = (nic) => {
    if (!nic || nic.length !== 12) return null;
    let year = parseInt(nic.substring(0, 4), 10);
    let dayOfYear = parseInt(nic.substring(4, 7), 10);
    if (dayOfYear > 500) { dayOfYear -= 500; }
    const birthDate = new Date(year, 0);
    birthDate.setDate(dayOfYear);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; }
    return age >= 18 ? age : null;
};

const RegisterPage = () => {
    const navigate = useNavigate();
    const { user, login } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', age: '', nic: '',
        gender: 'Male', role: 'Member', email: '',
        contactNumber: '', password: '', confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Login වී ඇත්නම්, member-dashboard එකට redirect කිරීම
    useEffect(() => {
        if (user) {
            if (user.role === 'Coach') {
                navigate('/coach-dashboard');
            } else {
                navigate('/member-dashboard');
            }
        }
    }, [user, navigate]);
    
    // NIC එක type කරන විට, වයස ස්වයංක්‍රීයව ගණනය කිරීම
    useEffect(() => {
        const calculatedAge = calculateAgeFromNIC(formData.nic);
        if (calculatedAge !== null) {
            setFormData(prev => ({ ...prev, age: calculatedAge.toString() }));
        } else if (formData.nic) {
             setFormData(prev => ({ ...prev, age: '' }));
        }
    }, [formData.nic]);

    // ක්ෂේත්‍ර වලංගුකරණය (Validation)
    const validateField = (name, value) => {
        switch (name) {
            case 'firstName':
            case 'lastName':
                return /^[A-Za-z\s]{3,}$/.test(value) ? '' : 'Name must be at least 3 characters.';
            case 'nic':
                if (value.length !== 12) return 'NIC number must be exactly 12 digits.';
                if (!/^\d+$/.test(value)) return 'NIC must only contain numbers.';
                const age = calculateAgeFromNIC(value);
                if (age === null) return 'You must be over 18 years old.';
                return '';
            case 'contactNumber':
                return /^(0\d{9})$/.test(value) ? '' : 'Must be a valid 10-digit number starting with 0.';
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Please enter a valid email.';
            case 'password':
                if (value.length < 8) return 'Password must be at least 8 characters long.';
                if (!/[A-Z]/.test(value)) return 'Must contain an uppercase letter.';
                if (!/[a-z]/.test(value)) return 'Must contain a lowercase letter.';
                if (!/\d/.test(value)) return 'Must contain a number.';
                if (!/[@$!%*?&]/.test(value)) return 'Must contain a special character (@$!%*?&).';
                return '';
            case 'confirmPassword':
                return value === formData.password ? '' : 'Passwords do not match.';
            default:
                return '';
        }
    };

    // Form එකේ input fields වෙනස් වන විට state එක යාවත්කාලීන කිරීම
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };
    
    // Input field එකෙන් ඉවතට click කළ විට (onBlur) validation කිරීම
    const handleBlur = (e) => {
        const { name, value } = e.target;
        if(value) {
            const errorMessage = validateField(name, value);
            setErrors(prev => ({ ...prev, [name]: errorMessage }));
        }
    };
    
    // ★★★ යාවත්කාලීන කරන ලද handleSubmit function එක ★★★
    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = {};
        let formIsValid = true;
        Object.keys(formData).forEach(name => {
            const errorMessage = validateField(name, formData[name]);
            if (errorMessage) {
                validationErrors[name] = errorMessage;
                formIsValid = false;
            }
        });
        
        if (!formIsValid) { setErrors(validationErrors); return; }
        
        setIsSubmitting(true);
        try {
            // Register endpoint එකට API call එක යැවීම. Backend එකෙන් සම්පූර්ණ user object එක token එක සමඟ නැවත ලැබේ.
            const { data } = await api.post('/members/register', formData);
            
            // Backend එකෙන් ලැබෙන user දත්ත වලින් login වීම
            login(data);

            alert('Registration Successful! Redirecting to your dashboard...');
            
            // ★ Role එක අනුව නිවැරදි dashboard එකට navigate කිරීම ★
            if (data.role === 'Coach') {
                navigate('/coach-dashboard');
            } else {
                // Member සහ Player යන දෙදෙනාම member-dashboard එකට යොමු කිරීම
                navigate('/member-dashboard');
            }

        } catch (err) {
            // Backend එකෙන් එන දෝෂ පණිවිඩය පෙන්වීම
            setErrors({ form: err.response?.data?.message || 'Registration failed.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="flex w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden">
                <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-gradient-to-br from-blue-900 to-gray-800 text-white p-12 text-center">
                    <h1 className="text-4xl font-bold mb-4">Welcome to SportNest</h1>
                    <p className="text-lg">Join our community of athletes and enthusiasts. Let's achieve greatness together!</p>
                </div>

                <div className="w-full lg:w-1/2 bg-white p-8 md:p-12">
                    <form onSubmit={handleSubmit} noValidate>
                        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Create Your Account</h2>
                        
                        {errors.form && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">{errors.form}</div>}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                                <input name="firstName" onChange={handleChange} onBlur={handleBlur} required className="input-field" placeholder="e.g. John"/>
                                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                                <input name="lastName" onChange={handleChange} onBlur={handleBlur} required className="input-field" placeholder="e.g. Doe"/>
                                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">NIC Number</label>
                                <input name="nic" onChange={handleChange} onBlur={handleBlur} required className="input-field" placeholder="12 Digits only"/>
                                {errors.nic && <p className="text-red-500 text-xs mt-1">{errors.nic}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Age</label>
                                <input name="age" type="text" value={formData.age} readOnly required className="input-field bg-gray-100 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="input-field">
                                    <option>Male</option>
                                    <option>Female</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                                <select name="role" value={formData.role} onChange={handleChange} className="input-field">
                                    <option>Member</option>
                                    <option>Player</option>
                                    <option>Coach</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Contact Number</label>
                                <input type="tel" name="contactNumber" onChange={handleChange} onBlur={handleBlur} required className="input-field" placeholder="0xxxxxxxxx"/>
                                {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                                <input type="email" name="email" onChange={handleChange} onBlur={handleBlur} required className="input-field" placeholder="you@example.com"/>
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                                <input type="password" name="password" onChange={handleChange} onBlur={handleBlur} required className="input-field" placeholder="••••••••"/>
                                {errors.password && <p className="text-red-500 text-xs mt-1 max-w-full">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Confirm Password</label>
                                <input type="password" name="confirmPassword" onChange={handleChange} onBlur={handleBlur} required className="input-field" placeholder="••••••••"/>
                                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                            </div>
                        </div>
                        <button type="submit" disabled={isSubmitting} className="submit-btn bg-orange-500 hover:bg-orange-600 w-full mt-8 font-bold py-3 px-4 rounded-lg text-white">
                            {isSubmitting ? 'Registering...' : 'Create My Account'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
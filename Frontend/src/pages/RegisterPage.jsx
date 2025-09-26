import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/MemberAuthContext';

// ඇසක හැඩයේ අයිකන දෙක (SVG icons for password visibility)
const EyeOpenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
);

const EyeClosedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2 2 0 01-2.828 2.828l-1.515-1.514A4 4 0 0010 14a4 4 0 10-2.032-7.44z" clipRule="evenodd" />
        <path d="M10 12a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
);

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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (user) {
            navigate(user.role === 'Coach' ? '/coach-dashboard' : '/member-dashboard');
        }
    }, [user, navigate]);

    useEffect(() => {
        const calculatedAge = calculateAgeFromNIC(formData.nic);
        setFormData(prev => ({ ...prev, age: calculatedAge ? calculatedAge.toString() : '' }));
    }, [formData.nic]);

    // ක්ෂේත්‍ර වලංගුකරණය (Validation)
    const validateField = (name, value) => {
        switch (name) {
            case 'firstName':
            case 'lastName':
                if (!/^[A-Za-z]+$/.test(value)) return 'Only letters are allowed.';
                if (value.length < 3) return 'Name must be at least 3 characters.';
                return '';
            case 'nic':
                if (!/^\d{12}$/.test(value)) return 'NIC must be exactly 12 digits.';
                if (!calculateAgeFromNIC(value)) return 'Invalid NIC or you must be over 18 years old.';
                return '';
            case 'contactNumber':
                if (!/^(?:\+94\d{9}|0\d{9})$/.test(value)) {
                    return 'Use format: 0xxxxxxxxx or +94xxxxxxxxx.';
                }
                return '';
            case 'email':
                if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(value)) {
                    return 'Please use only lowercase letters (e.g., yourname@example.com).';
                }
                return '';
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };
    
    const handleBlur = (e) => {
        const { name, value } = e.target;
        if (value) {
            const errorMessage = validateField(name, value);
            setErrors(prev => ({ ...prev, [name]: errorMessage }));
        }
    };
    
    // Form එක submit කිරීමේ ක්‍රියාවලිය
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 1. submit කිරීමට පෙර සියලුම ක්ෂේත්‍ර (fields) වලංගු දැයි පරීක්ෂා කිරීම
        let formIsValid = true;
        const validationErrors = Object.keys(formData).reduce((acc, name) => {
            const errorMessage = validateField(name, formData[name]);
            if (errorMessage) {
                formIsValid = false;
                acc[name] = errorMessage;
            }
            return acc;
        }, {});
        
        if (!formIsValid) { setErrors(validationErrors); return; }
        
        setIsSubmitting(true);
        try {
            // 2. සියල්ල නිවැරදි නම්, member ව ලියාපදිංචි කිරීමට එක් API ඇමතුමක් පමණක් යැවීම
            const { data } = await axios.post('/api/members/register', formData);

            // ★★ කිසිදු ක්‍රීඩාවකට ලියාපදිංචි කිරීමට දෙවන API ඇමතුමක් මෙහි නොමැත. මෙය නිවැරදියි! ★★
            
            // 3. ලියාපදිංචි වීම සාර්ථක වූ පසු, පරිශීලකයාව login කර dashboard එකට යොමු කිරීම
            login(data);
            alert('Registration Successful! Redirecting to your dashboard...');
            navigate(data.role === 'Coach' ? '/coach-dashboard' : '/member-dashboard');

        } catch (err) {
            // 4. ලියාපදිංචි වීම අසාර්ථක වුවහොත් දෝෂ පණිවිඩයක් පෙන්වීම
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
                                <input name="nic" onChange={handleChange} onBlur={handleBlur} required className="input-field" placeholder="12 Digits only" maxLength="12" />
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
                                <input type="tel" name="contactNumber" onChange={handleChange} onBlur={handleBlur} required className="input-field" placeholder="0xxxxxxxxx or +94xxxxxxxxx"/>
                                {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                                <input type="email" name="email" onChange={handleChange} onBlur={handleBlur} required className="input-field" placeholder="you@example.com"/>
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                            
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    name="password" 
                                    onChange={handleChange} 
                                    onBlur={handleBlur} 
                                    required 
                                    className="input-field" 
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500">
                                    {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                                </button>
                                {errors.password && <p className="text-red-500 text-xs mt-1 max-w-full">{errors.password}</p>}
                            </div>
                            
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Confirm Password</label>
                                <input 
                                    type={showConfirmPassword ? 'text' : 'password'} 
                                    name="confirmPassword" 
                                    onChange={handleChange} 
                                    onBlur={handleBlur} 
                                    required 
                                    className="input-field" 
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500">
                                    {showConfirmPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                                </button>
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
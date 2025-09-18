import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/MemberAuthContext';

// NIC එකෙන් වයස ගණනය කරන සහායක function එක
const calculateAgeFromNIC = (nic) => {
    if (!nic) return null;
    let year, dayOfYear;
    if (nic.length === 12 && /^\d+$/.test(nic)) {
        year = parseInt(nic.substring(0, 4), 10);
        dayOfYear = parseInt(nic.substring(4, 7), 10);
    } else if (nic.length === 10 && /^\d{9}[vVxX]$/.test(nic)) {
        year = 1900 + parseInt(nic.substring(0, 2), 10);
        dayOfYear = parseInt(nic.substring(2, 5), 10);
    } else { return null; }
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
        firstName: '',
        lastName: '',
        age: '',
        nic: '',
        gender: 'Male',
        role: 'Member', // ★ Default අගය 'Member' ලෙස සකසා ඇත
        email: '',
        contactNumber: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        if (user) navigate('/member-dashboard');
    }, [user, navigate]);

    useEffect(() => {
        const calculatedAge = calculateAgeFromNIC(formData.nic);
        if (calculatedAge !== null) {
            setFormData(prev => ({ ...prev, age: calculatedAge.toString() }));
        } else if (formData.nic) {
             setFormData(prev => ({ ...prev, age: '' }));
        }
    }, [formData.nic]);

    const validateField = (name, value) => {
        // ... (validation logic එකේ කිසිම වෙනසක් නැත, එය නිවැරදියි) ...
        switch (name) {
            case 'firstName':
            case 'lastName':
                return /^[A-Za-z\s]{3,}$/.test(value) ? '' : 'Name must be at least 3 characters.';
            case 'nic':
                const age = calculateAgeFromNIC(value);
                if (age === null) return 'Invalid NIC format or you must be over 18.';
                return '';
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Please enter a valid email.';
            case 'contactNumber':
                return /^(0\d{9})$/.test(value) ? '' : 'Please enter a valid 10-digit number.';
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
        if(value) {
            const errorMessage = validateField(name, value);
            setErrors(prev => ({ ...prev, [name]: errorMessage }));
        }
    };
    
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
            await axios.post('/api/members/register', formData);
            const { data } = await axios.post('/api/members/login', {
                email: formData.email,
                password: formData.password,
            });
            login(data);
            alert('Registration Successful! Redirecting to the dashboard...');
            navigate(data.role === 'admin' ? '/admin-dashboard' : '/member-dashboard');
        } catch (err) {
            setErrors({ form: err.response?.data?.message || 'Registration failed.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-6" style={{backgroundColor: '#F8F9FA'}}>
            <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-4xl border border-gray-200" noValidate>
                 <h2 className="text-3xl font-bold mb-8 text-center" style={{color: '#0D1B2A'}}>Create Your SportNest Account</h2>
                {errors.form && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 text-center">{errors.form}</div>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                     <div>
                        <label>First Name  </label>
                        <input name="firstName" onChange={handleChange} onBlur={handleBlur} required />
                        {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                     </div>
                     <div>
                        <label>Last Name. </label>
                        <input name="lastName" onChange={handleChange} onBlur={handleBlur} required />
                        {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                     </div>
                     <div>
                        <label>NIC Number  </label>
                        <input name="nic" onChange={handleChange} onBlur={handleBlur} required />
                        {errors.nic && <p className="text-red-500 text-xs mt-1">{errors.nic}</p>}
                     </div>
                     <div>
                        <label>Age. </label>
                        <input name="age" type="text" value={formData.age} readOnly required className="bg-gray-100 cursor-not-allowed" />
                     </div>
                     <div>
                        <label>Gender  </label>
                        <select name="gender" value={formData.gender} onChange={handleChange}><option>Male</option><option>Female</option></select>
                     </div>
                     
                     {/* ★★★ Role තේරීමේ Dropdown එක මෙතැනට නැවත එකතු කර ඇත ★★★ */}
                     <div>
                        <label>Role</label>
                        <select name="role" value={formData.role} onChange={handleChange}>
                           <option>Member</option>
                           <option>Player</option>
                           <option>Coach</option>
                           
                        </select>
                     </div>
                     
                     <div className="md:col-span-2">
                        <label>Contact Number. </label>
                        <input type="tel" name="contactNumber" onChange={handleChange} onBlur={handleBlur} required />
                        {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
                     </div>
                     <div className="md:col-span-2">
                        <label>Email Address. </label>
                        <input type="email" name="email" onChange={handleChange} onBlur={handleBlur} required />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                     </div>
                     <div>
                        <label>Password. </label>
                        <input type="password" name="password" onChange={handleChange} onBlur={handleBlur} required />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                     </div>
                     <div>
                        <label>Confirm Password. </label>
                        <input type="password" name="confirmPassword" onChange={handleChange} onBlur={handleBlur} required />
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                     </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full mt-8 font-bold py-3 px-4 rounded-lg text-white" style={{backgroundColor: '#FF6700'}}>
                    {isSubmitting ? 'Registering...' : 'Create My Account'}
                </button>
            </form>
        </div>
    );
};

export default RegisterPage;
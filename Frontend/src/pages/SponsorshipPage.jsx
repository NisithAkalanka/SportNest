// frontend/src/pages/SponsorshipPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrophy } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const sponsorshipPlans = [
    { name: 'Silver', price: 50000, features: ['Logo on our website', 'Social media shout-out', '2 event passes'] },
    { name: 'Gold', price: 100000, features: ['All Silver benefits', 'Banner at one event', 'Logo on team t-shirts'] },
    { name: 'Platinum', price: 250000, features: ['All Gold benefits', 'Main event sponsorship', 'Banner at all events'] }
];

const SponsorshipPage = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        fullName: '',
        organizationName: '',
        contactPerson: '',
        email: '',
        phoneNumber: '',
        address: '',
        sponsorshipPlan: 'Silver',
        sponsorshipAmount: 50000,
        startDate: '',
        endDate: '',
        agreedToTerms: false,
        agreedToLogoUsage: false
    });
    
    const [errors, setErrors] = useState({});
    
    const [manageableApp, setManageableApp] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        const savedAppData = localStorage.getItem('sponsorshipApplication');
        if (savedAppData) {
            setManageableApp(JSON.parse(savedAppData));
        }
    }, []);

    const validateField = (name, value) => {
        switch (name) {
            case 'fullName':
            case 'organizationName':
            case 'contactPerson':
                const nameRegex = /^[A-Za-z\s]+$/;
                return nameRegex.test(value) ? '' : 'This field must contain only letters and spaces.';
            
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value) ? '' : 'Please enter a valid email address (e.g., user@domain.com).';

            // ★★★ දුරකථන අංකය සඳහා නව Validation එක ★★★
            case 'phoneNumber':
                // `0` වලින් පටන්ගන්නා ඉලක්කම් 10ක් හෝ `+94` වලින් පටන්ගන්නා ඉලක්කම් 9ක් සහිත අංකයක්දැයි පරීක්ෂා කරයි.
                const phoneRegex = /^(0\d{9}|\+94\d{9})$/;
                return phoneRegex.test(value) ? '' : 'Invalid phone number (e.g., 0771234567 or +94771234567).';
            
            case 'address':
                return value.length <= 50 ? '' : 'Address cannot be longer than 50 characters.';
            
            case 'startDate':
                const minStartDate = new Date('2025-09-01T00:00:00Z');
                const selectedStartDate = new Date(value);
                return selectedStartDate >= minStartDate ? '' : 'Start date must be on or after September 1, 2025.';

            case 'endDate':
                 if (!formData.startDate) return '';
                 const startDateForEndCheck = new Date(formData.startDate);
                 const selectedEndDate = new Date(value);
                 return selectedEndDate > startDateForEndCheck ? '' : 'End date must be after the start date.';

            default:
                return '';
        }
    };
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: newValue }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const errorMessage = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: errorMessage }));
    };

    const handlePlanSelect = (plan) => {
        setFormData(prev => ({ ...prev, sponsorshipPlan: plan.name, sponsorshipAmount: plan.price }));
        document.getElementById('sponsorship-form').scrollIntoView({ behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const validationErrors = {};
        Object.keys(formData).forEach(name => {
            const errorMessage = validateField(name, formData[name]);
            if (errorMessage) {
                validationErrors[name] = errorMessage;
            }
        });
        
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setError('Please correct the errors highlighted below.');
            return;
        }

        if (!formData.agreedToTerms || !formData.agreedToLogoUsage) {
            setError('Please agree to the terms and conditions and logo usage.');
            return;
        }
        
        setIsSubmitting(true);

        try {
            const response = await axios.post('/api/sponsorships', formData);
            const { sponsorshipId, accessToken, message } = response.data;
            const appData = { id: sponsorshipId, token: accessToken };
            localStorage.setItem('sponsorshipApplication', JSON.stringify(appData));
            setManageableApp(appData);
            setSuccess(message || 'Application submitted successfully! Redirecting...');
            setTimeout(() => {
                navigate(`/sponsorship/manage/${sponsorshipId}?token=${accessToken}`);
            }, 2000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to submit application. Please check the form and try again.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto my-10 px-4">
             {/* --- Header & Plans Section (No Changes) --- */}
             <div className="text-center mb-16"><h1 className="text-5xl font-extrabold text-gray-800 mb-4">Partner with Us</h1><p className="text-xl text-gray-600">📌 Sponsorship Requirements – Smart Sport Management System...</p></div>
             <div className="mb-12"><h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Our Sponsorship Tiers</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-8">{sponsorshipPlans.map(plan=>(<div key={plan.name} className="border-2 p-6 rounded-lg text-center flex flex-col hover:border-indigo-500 hover:shadow-xl transition-all duration-300"><h3 className={`text-2xl font-bold mb-4 ${plan.name==='Gold' ? 'text-yellow-500' :plan.name==='Platinum' ? 'text-gray-700' :'text-gray-400'}`}>{plan.name}</h3><p className="text-4xl font-bold mb-4">{plan.price.toLocaleString()} LKR</p><ul className="text-left space-y-2 flex-grow mb-6">{plan.features.map(feat=><li key={feat} className="flex items-center"><FaTrophy className="text-green-500 mr-2 flex-shrink-0"/> {feat}</li>)}</ul><button onClick={()=>handlePlanSelect(plan)} className="mt-auto bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700">Select {plan.name}</button></div>))}</div></div>
             {manageableApp && !success && (<div className="text-center mb-8 bg-blue-100 p-4 rounded-lg border border-blue-300"><p className="text-blue-800 mb-2">You have a recent application. Want to manage it?</p><button onClick={()=>navigate(`/sponsorship/manage/${manageableApp.id}?token=${manageableApp.token}`)} className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">Manage My Recent Application</button></div>)}

            {/* --- Form --- */}
            <form onSubmit={handleSubmit} id="sponsorship-form" className="bg-white p-8 rounded-lg shadow-xl border">
                 <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Sponsorship Application Form</h2>
                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">{error}</div>}
                {success && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6">{success}</div>}

                {!success && <>
                    <fieldset className="border rounded-lg p-4 mb-6">
                        <legend className="font-bold text-lg px-2">1. Sponsorship Information</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-2">
                           <div><input name="fullName" value={formData.fullName} onChange={handleChange} onBlur={handleBlur} placeholder="Full Name *" required className="input-field" /><p className="text-red-500 text-xs mt-1 h-4">{errors.fullName}</p></div>
                           <div><input name="LastName" value={formData.LastName} onChange={handleChange} onBlur={handleBlur} placeholder="LastName *" required className="input-field" /><p className="text-red-500 text-xs mt-1 h-4">{errors.LastName}</p></div>
                           <div><input name="organizationName" value={formData.organizationName} onChange={handleChange} onBlur={handleBlur} placeholder="Organization Name *" required className="input-field" /><p className="text-red-500 text-xs mt-1 h-4">{errors.organizationName}</p></div>
                           <div><input name="contactPerson" value={formData.contactPerson} onChange={handleChange} onBlur={handleBlur} placeholder="Contact Person Name *" required className="input-field" /><p className="text-red-500 text-xs mt-1 h-4">{errors.contactPerson}</p></div>
                           <div><input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} placeholder="Email Address *" required className="input-field" /><p className="text-red-500 text-xs mt-1 h-4">{errors.email}</p></div>
                           <div>
                                {/* ★★★ දෝෂ පණිවිඩය පෙන්වීමට අවශ්‍ය <p> tag එක ★★★ */}
                                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} onBlur={handleBlur} placeholder="Phone Number *" required className="input-field" />
                                <p className="text-red-500 text-xs mt-1 h-4">{errors.phoneNumber}</p>
                           </div>
                           <div className="md:col-span-2">
                             <input name="address" value={formData.address} onChange={handleChange} onBlur={handleBlur} placeholder="Full Address (Street, City, Country) *" required className="input-field" />
                             <p className="text-red-500 text-xs mt-1 h-4">{errors.address}</p>
                           </div>
                        </div>
                    </fieldset>
                    
                    <fieldset className="border rounded-lg p-4 mb-6">
                         <legend className="font-bold text-lg px-2">2. Sponsorship Details</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-2">
                             <div><label className="form-label">Sponsorship Plan *</label><select name="sponsorshipPlan" value={formData.sponsorshipPlan} onChange={handleChange} required className="input-field">{sponsorshipPlans.map(plan => (<option key={plan.name} value={plan.name}>{plan.name} - {plan.price.toLocaleString()} LKR</option>))}</select><p className="h-4"></p></div>
                             <div><label className="form-label">Amount (LKR)</label><input type="text" value={formData.sponsorshipAmount.toLocaleString()} readOnly className="input-field bg-gray-100"/><p className="h-4"></p></div>
                             <div><label className="form-label">Sponsorship Start Date *</label><input type="date" name="startDate" value={formData.startDate} onChange={handleChange} onBlur={handleBlur} required className="input-field" min="2025-09-01"/><p className="text-red-500 text-xs mt-1 h-4">{errors.startDate}</p></div>
                             <div><label className="form-label">Sponsorship End Date *</label><input type="date" name="endDate" value={formData.endDate} onChange={handleChange} onBlur={handleBlur} required className="input-field"/><p className="text-red-500 text-xs mt-1 h-4">{errors.endDate}</p></div>
                        </div>
                    </fieldset>
                    
                    <fieldset className="mb-6"><legend className="font-bold text-lg mb-2">4. Agreement & Conditions</legend><div className="space-y-2 mt-2"><label className="flex items-center"><input type="checkbox" name="agreedToTerms" checked={formData.agreedToTerms} onChange={handleChange} required className="mr-3 h-5 w-5"/> I agree to the terms and conditions.</label><label className="flex items-center"><input type="checkbox" name="agreedToLogoUsage" checked={formData.agreedToLogoUsage} onChange={handleChange} required className="mr-3 h-5 w-5"/> I allow the club to use my brand/logo.</label></div></fieldset>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400">{isSubmitting ? 'Submitting...' : 'Submit Application'}</button>
                </>}
            </form>
        </div>
    );
};

export default SponsorshipPage;
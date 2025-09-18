

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

const SponsorshipManagePage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [formData, setFormData] = useState(null);
    const [isEditable, setIsEditable] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchSponsorshipData = async () => {
            if (!token) {
                setError('No access token provided. Access denied.');
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`/api/sponsorships/${id}?token=${token}`);
                setFormData(response.data.sponsorship);
                setIsEditable(response.data.isEditable);
            } catch (err) {
                setError('Could not fetch your application details. The link may be invalid or expired.');
            } finally {
                setLoading(false);
            }
        };

        fetchSponsorshipData();
    }, [id, token]);
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSuccess('');
        setError('');
        try {
            await axios.put(`/api/sponsorships/${id}?token=${token}`, formData);
            setSuccess('Application updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update. The editing period may have expired.');
        }
    };
    
    
    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this application permanently?')) {
            try {
                
                await axios.delete(`/api/sponsorships/${id}?token=${token}`);
                
                
                localStorage.removeItem('sponsorshipApplication');

                
                alert('Application deleted successfully.');
                navigate('/club'); 

            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete. The deletion period may have expired.');
            }
        }
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
    };

    if (loading) return <div className="text-center p-10">Loading your application...</div>;
    
    return (
        <div className="container mx-auto my-10 px-4">
            <h1 className="text-4xl font-bold text-center mb-8">Manage Your Sponsorship Application</h1>

            {error && <div className="bg-red-100 border-red-500 text-red-700 border-l-4 p-4 mb-4">{error}</div>}
            {success && <div className="bg-green-100 border-green-500 text-green-700 border-l-4 p-4 mb-4">{success}</div>}
            
            {formData && (
                <form onSubmit={handleUpdate} className="bg-white p-8 rounded-lg shadow-xl border">
                    <fieldset disabled={!isEditable} className="space-y-6">
                        {!isEditable && <p className="text-yellow-600 bg-yellow-100 p-3 rounded-md text-center">The 5-hour editing period has expired. You can no longer modify this application.</p>}

                        {/* --- Sponsorship Information --- */}
                        <fieldset className="border rounded-lg p-4">
                            <legend className="font-bold text-lg px-2">1. Sponsorship Information</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <input name="fullName" value={formData.fullName || ''} onChange={handleChange} placeholder="Full Name *" required className="input-field" />
                                <input name="organizationName" value={formData.organizationName || ''} onChange={handleChange} placeholder="Organization Name *" required className="input-field" />
                                <input name="contactPerson" value={formData.contactPerson || ''} onChange={handleChange} placeholder="Contact Person Name *" required className="input-field" />
                                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} placeholder="Email Address *" required className="input-field" />
                                <input type="tel" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} placeholder="Phone Number *" required className="input-field" />
                                <div className="md:col-span-2">
                                   <input name="address" value={formData.address || ''} onChange={handleChange} placeholder="Full Address (Street, City, Country) *" required className="input-field" />
                                </div>
                            </div>
                        </fieldset>

                        {/* --- Sponsorship Details --- */}
                        <fieldset className="border rounded-lg p-4">
                            <legend className="font-bold text-lg px-2">2. Sponsorship Details</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                                 <div>
                                     <label className="form-label">Sponsorship Plan *</label>
                                     <select name="sponsorshipPlan" value={formData.sponsorshipPlan || 'Silver'} onChange={handleChange} required className="input-field">
                                         <option value="Silver">Silver - 50,000 LKR</option>
                                         <option value="Gold">Gold - 100,000 LKR</option>
                                         <option value="Platinum">Platinum - 250,000 LKR</option>
                                    </select>
                                 </div>
                                 <div>
                                     <label className="form-label">Amount (LKR)</label>
                                     <input type="text" name="sponsorshipAmount" value={formData.sponsorshipAmount || 0} readOnly className="input-field bg-gray-100"/>
                                 </div>
                                 <div>
                                    <label className="form-label">Sponsorship Start Date *</label>
                                    <input type="date" name="startDate" value={formatDateForInput(formData.startDate)} onChange={handleChange} required className="input-field"/>
                                </div>
                                 <div>
                                     <label className="form-label">Sponsorship End Date *</label>
                                    <input type="date" name="endDate" value={formatDateForInput(formData.endDate)} onChange={handleChange} required className="input-field"/>
                                </div>
                            </div>
                        </fieldset>
                        
                        {/* --- Agreement & Conditions --- */}
                        <fieldset className="border rounded-lg p-4">
                            <legend className="font-bold text-lg px-2">4. Agreement & Conditions</legend>
                            <div className="space-y-2 mt-2">
                                 <label className="flex items-center"><input type="checkbox" name="agreedToTerms" checked={formData.agreedToTerms || false} onChange={handleChange} required className="mr-3 h-5 w-5"/> I agree to the terms and conditions.</label>
                                 <label className="flex items-center"><input type="checkbox" name="agreedToLogoUsage" checked={formData.agreedToLogoUsage || false} onChange={handleChange} required className="mr-3 h-5 w-5"/> I allow the club to use my brand/logo.</label>
                            </div>
                        </fieldset>

                        {isEditable && (
                            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 pt-4">
                                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">Update Application</button>
                                <button type="button" onClick={handleDelete} className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700">Delete Application</button>
                            </div>
                        )}
                    </fieldset>
                </form>
            )}
        </div>
    );
};

export default SponsorshipManagePage;
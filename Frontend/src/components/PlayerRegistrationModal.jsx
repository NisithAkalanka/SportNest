// Frontend/src/components/PlayerRegistrationModal.jsx

import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/MemberAuthContext';
import { Button } from './ui/button'; 
import { Input } from './ui/input';   
import { Label } from './ui/label';   
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Textarea } from './ui/textarea';

const PlayerRegistrationModal = ({ sportName, onClose, onRegisterSuccess }) => {
    const { user } = useContext(AuthContext); 

    const [formData, setFormData] = useState({
        fullName: '', 
        clubId: '', 
        membershipId: '', 
        contactNumber: '', 
        dateOfBirth: '',
        emergencyContactName: '', 
        emergencyContactNumber: '',
        skillLevel: 'Beginner', 
        healthHistory: ''
    });

    const [error, setError] = useState(''); // General error message for submission
    const [errors, setErrors] = useState({}); // Individual field errors සඳහා වන state එක
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: (user.firstName && user.lastName) ? `${user.firstName} ${user.lastName}` : '',
                clubId: user.clubId || '',
                membershipId: user.membershipId || '', 
                contactNumber: user.contactNumber || ''
            }));
        }
    }, [user]);
    
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    // ★★★ ඔබගේ අවශ්‍යතාවය පරිදි යාවත්කාලීන කළ validation function එක ★★★
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    const validate = () => {
        const newErrors = {};

        // Membership ID Validation
        if (!formData.membershipId) {
            newErrors.membershipId = "Membership ID is required.";
        } else if (!/^MEM-\d{6,}$/.test(formData.membershipId)) {
            newErrors.membershipId = "Invalid format. Use MEM-xxxxxx.";
        }

        // Date of Birth Validation
        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = "Date of Birth is required.";
        } else {
            const selectedDate = new Date(formData.dateOfBirth);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Compare dates only
            if (selectedDate >= today) {
                newErrors.dateOfBirth = "Date of Birth must be in the past.";
            }
        }

        // Emergency Contact Name Validation
        if (!formData.emergencyContactName) {
            newErrors.emergencyContactName = "Emergency contact name is required.";
        } else if (!/^[A-Za-z\s]+$/.test(formData.emergencyContactName)) {
            newErrors.emergencyContactName = "Name can only contain letters and spaces.";
        } else if (formData.emergencyContactName.trim().length < 3) {
            newErrors.emergencyContactName = "Name must be at least 3 characters long.";
        }

        // Emergency Contact Number Validation
        if (!formData.emergencyContactNumber) {
            newErrors.emergencyContactNumber = "Emergency contact number is required.";
        } else if (!/^(?:\+94\d{9}|0\d{9})$/.test(formData.emergencyContactNumber)) {
            newErrors.emergencyContactNumber = "Use a valid format: 0xxxxxxxxx or +94xxxxxxxxx.";
        }

        // Health History Validation (Optional field)
        if (formData.healthHistory) {
            const words = formData.healthHistory.trim().split(/\s+/).filter(Boolean);
            if (words.length > 150) {
                newErrors.healthHistory = `Cannot exceed 150 words. You currently have ${words.length} words.`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // දෝෂ නොමැතිනම් 'true' ලෙස return කරයි
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if(errors[name]) {
            setErrors(prev => ({...prev, [name]: null}));
        }
    };
    
    const handleSelectChange = (value) => {
        setFormData({ ...formData, skillLevel: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess(''); 

        if (!validate()) {
            return; 
        }

        setLoading(true);
        const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
        if (!token) {
            setError("You must be logged in to register.");
            setLoading(false);
            return;
        }
        
        const registrationData = { 
            ...formData, 
            sportName,
        };
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        try {
            await axios.post('/api/players/register', registrationData, config);
            setSuccess(`Successfully registered for ${sportName}!`);
            setTimeout(() => {
                if(onRegisterSuccess) onRegisterSuccess();
                onClose(); 
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };
    
    const maxDate = new Date().toISOString().split("T")[0];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-center">Register for {sportName}</h2>
                
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
                {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

                {!success && (
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div>
                               <Label htmlFor="fullName">Full Name*</Label>
                               <Input id="fullName" name="fullName" value={formData.fullName} required className="bg-gray-100 cursor-not-allowed" disabled />
                            </div>
                            <div>
                               <Label htmlFor="clubId">Club ID*</Label>
                               <Input id="clubId" name="clubId" value={formData.clubId} required className="bg-gray-100 cursor-not-allowed" disabled />
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="membershipId">Membership ID*</Label>
                                <Input id="membershipId" name="membershipId" value={formData.membershipId} readOnly required className="bg-gray-100 cursor-not-allowed" />
                                {errors.membershipId && <p className="text-red-500 text-xs mt-1">{errors.membershipId}</p>}
                            </div>
                            <div>
                               <Label htmlFor="contactNumber">Contact Number*</Label>
                               <Input id="contactNumber" type="tel" name="contactNumber" value={formData.contactNumber} readOnly required className="bg-gray-100 cursor-not-allowed" />
                            </div>
                            <div>
                                <Label htmlFor="dateOfBirth">Date of Birth*</Label>
                                <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} max={maxDate} required />
                                {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
                            </div>
                             <div>
                                <Label htmlFor="emergencyContactName">Emergency Contact Name*</Label>
                                <Input id="emergencyContactName" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} required />
                                {errors.emergencyContactName && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactName}</p>}
                            </div>
                            <div>
                                <Label htmlFor="emergencyContactNumber">Emergency Contact Number*</Label>
                                <Input id="emergencyContactNumber" name="emergencyContactNumber" type="tel" value={formData.emergencyContactNumber} onChange={handleChange} required />
                                {errors.emergencyContactNumber && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactNumber}</p>}
                            </div>
                             <div className="md:col-span-2">
                                <Label htmlFor="skillLevel">Skill Level*</Label>
                                <Select onValueChange={handleSelectChange} defaultValue={formData.skillLevel}>
                                     <SelectTrigger><SelectValue/></SelectTrigger>
                                     <SelectContent>
                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                                        <SelectItem value="Advanced">Advanced</SelectItem>
                                        <SelectItem value="Professional">Professional</SelectItem>
                                     </SelectContent>
                                </Select>
                            </div>
                             <div className="md:col-span-2">
                               <Label htmlFor="healthHistory">Health History (Optional)</Label>
                               <Textarea id="healthHistory" name="healthHistory" value={formData.healthHistory} onChange={handleChange} rows="3" placeholder="Mention any injuries or health issues" />
                               {/* ★★★ Health History දෝෂ පණිවිඩය පෙන්වීම සඳහා ★★★ */}
                               {errors.healthHistory && <p className="text-red-500 text-xs mt-1">{errors.healthHistory}</p>}
                           </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-4">
                            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                            <Button type="submit" disabled={loading} style={{backgroundColor: '#FF6700'}}>
                                {loading ? 'Submitting...' : 'Submit Registration'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PlayerRegistrationModal;
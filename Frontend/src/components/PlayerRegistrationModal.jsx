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
        fullName: '', clubId: '', contactNumber: '', dateOfBirth: '',
        emergencyContactName: '', emergencyContactNumber: '',
        skillLevel: 'Beginner', healthHistory: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: user.name || '',
                clubId: user.clubId || '',
                contactNumber: user.contactNumber || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSelectChange = (value) => setFormData({ ...formData, skillLevel: value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess(''); setLoading(true);

        const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
        if (!token) {
            setError("You must be logged in to register.");
            setLoading(false);
            return;
        }

        const registrationData = { ...formData, sportName };
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
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-center">Register for {sportName}</h2>
                
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
                {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

                {!success && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        {/* ★★★ මෙන්න සම්පූර්ණ, නිවැරදි කරන ලද Form එක ★★★ */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            
                            {/* --- Auto-filled සහ Disabled Fields --- */}
                            <div>
                               <Label htmlFor="fullName">Full Name*</Label>
                               <Input id="fullName" name="fullName" value={formData.fullName} required className="bg-gray-100 cursor-not-allowed" disabled />
                            </div>
                            <div>
                               <Label htmlFor="clubId">Club ID*</Label>
                               <Input id="clubId" name="clubId" value={formData.clubId} required className="bg-gray-100 cursor-not-allowed" disabled />
                            </div>
                            <div>
                               <Label htmlFor="contactNumber">Contact Number*</Label>
                               <Input id="contactNumber" type="tel" name="contactNumber" value={formData.contactNumber} required className="bg-gray-100 cursor-not-allowed" disabled />
                            </div>
                            
                            {/* --- User විසින් පිරවිය යුතු Fields --- */}
                            <div>
                                <Label htmlFor="dateOfBirth">Date of Birth*</Label>
                                <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required />
                            </div>
                             <div>
                                <Label htmlFor="emergencyContactName">Emergency Contact Name*</Label>
                                <Input id="emergencyContactName" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} required />
                            </div>
                            <div>
                                <Label htmlFor="emergencyContactNumber">Emergency Contact Number*</Label>
                                <Input id="emergencyContactNumber" name="emergencyContactNumber" type="tel" value={formData.emergencyContactNumber} onChange={handleChange} required />
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
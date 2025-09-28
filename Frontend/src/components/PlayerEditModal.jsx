// Frontend/src/components/PlayerEditModal.jsx

import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/MemberAuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';


const PlayerEditModal = ({ profile, onClose, onUpdate }) => {
    // find the logged in user from context
    const { user } = useContext(AuthContext);
    
    // store form data in state
    const [formData, setFormData] = useState({
        contactNumber: '',
        emergencyContactName: '',
        emergencyContactNumber: '',
        skillLevel: 'Beginner',
    });
    
    // Loading state 
    const [loading, setLoading] = useState(false);
    // Error message state 
    const [error, setError] = useState('');


    // fill form data when profile prop changes
    useEffect(() => {
        if (profile) {
            setFormData({
                contactNumber: profile.contactNumber || '',
                emergencyContactName: profile.emergencyContactName || '',
                emergencyContactNumber: profile.emergencyContactNumber || '',
                skillLevel: profile.skillLevel || 'Beginner'
            });
        }
    }, [profile]);


    // restore form data when profile prop changes
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    // restore skill level when changed
    const handleSelectChange = (value) => setFormData({ ...formData, skillLevel: value });

    // 'Save Changes' button click kala wita ena function eka
    const handleSubmit = async (e) => {
        e.preventDefault(); // poramaya submit wima nawatwima
        setLoading(true);
        setError('');
        
        try {
            // get the token from logged in user
            const token = user?.token;
            // API request ekata awashya headers sakas kirima
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // Backend eke adala route ekata 'PUT' request ekak yawima
            await axios.put(`/api/players/profile/${profile._id}`, formData, config);
            
            alert("Update successful!");
            onUpdate(); // Dashboard eke data refetch kirimata signal ekak yawima
            onClose();  // close Modal 
        
        } catch (error) {
            setError(error.response?.data?.message || 'Update failed. Please try again.');
            console.error("Player profile update error:", error);
        
        } finally {
            setLoading(false);
        }
    };
    
    // profile prop eka load wi nomathinam modal eka nopenwima
    if (!profile) return null;

    // Modal eke JSX (HTML) structure eka
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg w-full max-w-md shadow-2xl">
                <form onSubmit={handleSubmit} >
                    <h2 className="text-2xl font-bold mb-6 text-center">Edit Registration for: <br/> <span className="text-blue-600">{profile.sportName}</span></h2>
                    
                    {error && <p className="text-red-500 bg-red-100 p-2 rounded text-center mb-4">{error}</p>}
                    
                    <div className="space-y-4">
                        <div>
                            <Label>Contact Number</Label>
                            <Input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required className="input-field" />
                        </div>
                         <div>
                            <Label>Emergency Contact Name</Label>
                            <Input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} required className="input-field" />
                        </div>
                         <div>
                            <Label>Emergency Contact Number</Label>
                            <Input type="tel" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleChange} required className="input-field" />
                        </div>
                        <div>
                            <Label>Skill Level</Label>
                            <Select onValueChange={handleSelectChange} value={formData.skillLevel}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                    <SelectItem value="Advanced">Advanced</SelectItem>
                                    <SelectItem value="Professional">Professional</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 mt-8">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading} style={{backgroundColor: '#FF6700'}}>
                           {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PlayerEditModal;
// Frontend/src/components/PlayerEditModal.jsx

import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/MemberAuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';


const PlayerEditModal = ({ profile, onClose, onUpdate }) => {
    // AuthContext එකෙන් login වී සිටින user ගේ දත්ත ලබාගැනීම
    const { user } = useContext(AuthContext);
    
    // පෝරමයේ දත්ත ගබඩා කර තබාගැනීමට state එකක්
    const [formData, setFormData] = useState({
        contactNumber: '',
        emergencyContactName: '',
        emergencyContactNumber: '',
        skillLevel: 'Beginner',
    });
    
    // දත්ත save වන විට 'Saving...' ලෙස පෙන්වීමට state එකක්
    const [loading, setLoading] = useState(false);
    // දෝෂ පණිවිඩ පෙන්වීමට state එකක්
    const [error, setError] = useState('');


    // Modal එක open වන විට, 'profile' prop එකෙන් එන දත්ත වලින් පෝරමය පිරවීම
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


    // Input fields වල ටයිප් කරන විට state එක යාවත්කාලීන කිරීම
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    // Skill Level select කරන විට state එක යාවත්කාලීන කිරීම
    const handleSelectChange = (value) => setFormData({ ...formData, skillLevel: value });

    // 'Save Changes' බොත්තම එබූ විට ක්‍රියාත්මක වන function එක
    const handleSubmit = async (e) => {
        e.preventDefault(); // පෝරමය submit වීම නැවැත්වීම
        setLoading(true);
        setError('');
        
        try {
            // Local storage එකෙන් token එක ලබාගැනීම
            const token = user?.token;
            // API request එකට අවශ්‍ය headers සකස් කිරීම
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // Backend එකේ අදාළ route එකට 'PUT' request එකක් යැවීම
            await axios.put(`/api/players/profile/${profile._id}`, formData, config);
            
            alert("Update successful!");
            onUpdate(); // Dashboard එකේ දත්ත refetch කිරීමට signal එකක් යැවීම
            onClose();  // Modal එක close කිරීම
        
        } catch (error) {
            setError(error.response?.data?.message || 'Update failed. Please try again.');
            console.error("Player profile update error:", error);
        
        } finally {
            setLoading(false);
        }
    };
    
    // profile prop එක load වී නොමැතිනම්, modal එක නොපෙන්වීම
    if (!profile) return null;

    // Modal එකේ JSX (HTML) ව්‍යුහය
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
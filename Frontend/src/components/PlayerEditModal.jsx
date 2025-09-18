import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/MemberAuthContext';

const PlayerEditModal = ({ profile, onClose, onUpdate }) => {
    const { user } = useContext(AuthContext);

    // profile එකෙන් එන data වලින් state එක initialize කරනවා
    const [formData, setFormData] = useState({
        contactNumber: '',
        emergencyContactName: '',
        emergencyContactNumber: '',
        skillLevel: 'Beginner',
    });

    // profile prop එකේ වෙනසක් වුනොත් form එක update කරනවා
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


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = user?.token || JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // Backend එකේ route එකට ගැලපෙන ලෙස path එක නිවැරදි කර ඇත
            await axios.put(`/api/players/${profile._id}`, formData, config);
            
            alert("Update successful!");
            onUpdate(); // Dashboard එකේ data refetch කිරීමට signal එක දෙනවා
            onClose();  // Modal එක close කරනවා
        } catch (error) {
            console.error("Player profile update error:", error);
            alert("Update failed! " + (error.response?.data?.message || 'Please try again.'));
        }
    };
    
    // profile එක load වෙලා නැත්නම් modal එක පෙන්නන්නේ නැහැ
    if (!profile) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg w-full max-w-md shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-center">Edit Registration for: <br/> <span className="text-blue-600">{profile.sportName}</span></h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                        <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required className="input-field" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Emergency Contact Name</label>
                        <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} required className="input-field" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Emergency Contact Number</label>
                        <input type="tel" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleChange} required className="input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Skill Level</label>
                        <select name="skillLevel" value={formData.skillLevel} onChange={handleChange} required className="input-field">
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                            <option>Professional</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-4 mt-8">
                    <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">Cancel</button>
                    <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">Save Changes</button>
                </div>
            </form>
        </div>
    );
};

// ★★★★★ වැදගත්ම කොටස: Component එක export කිරීම ★★★★★
export default PlayerEditModal;
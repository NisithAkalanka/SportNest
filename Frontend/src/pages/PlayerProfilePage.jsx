

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/MemberAuthContext';

const PlayerProfilePage = () => {
    const { user } = useContext(AuthContext);
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingProfileId, setEditingProfileId] = useState(null); 
    const [formData, setFormData] = useState({});

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('/api/players/my-profiles', config);
            setProfiles(data);
        } catch (err) {
            setError('Could not fetch profiles. You may not have any registrations yet.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchProfiles();
    }, [user]);

    const handleEditClick = (profile) => {
        setEditingProfileId(profile._id);
        setFormData(profile); 
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`/api/players/profile/${editingProfileId}`, formData, config);
            alert("Profile updated!");
            setEditingProfileId(null);
            fetchProfiles(); 
        } catch (err) {
            alert("Update failed!");
        }
    };

    const handleDelete = async (profileId) => {
        if (window.confirm("Are you sure you want to delete this registration?")) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete(`/api/players/profile/${profileId}`, config);
                alert("Registration deleted!");
                fetchProfiles(); 
            } catch (err) {
                alert("Deletion failed!");
            }
        }
    };

    const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});
    
    if (loading) return <div>Loading...</div>;

    // --- Edit Form ---
    if (editingProfileId) {
        return (
            <div className="container mx-auto p-4">
                <h2 className="text-2xl font-bold mb-4">Editing Registration for {formData.sportName}</h2>
                
                <form onSubmit={handleUpdate}>
                   
                    <button type="submit">Save Changes</button>
                    <button onClick={() => setEditingProfileId(null)}>Cancel</button>
                </form>
            </div>
        )
    }

    // --- Profile List ---
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">My Player Registrations</h1>
            {error && <p className="text-red-500">{error}</p>}
            <div className="space-y-4">
                {profiles.map(profile => (
                    <div key={profile._id} className="p-4 border rounded-lg">
                        <h2 className="text-xl font-bold">{profile.sportName}</h2>
                        <p><strong>Club ID:</strong> {profile.clubId}</p>
                        <p><strong>Skill Level:</strong> {profile.skillLevel}</p>
                        
                        <div className="mt-4 space-x-2">
                            <button onClick={() => handleEditClick(profile)} className="bg-blue-500 text-white px-3 py-1 rounded">Edit</button>
                            <button onClick={() => handleDelete(profile._id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default PlayerProfilePage;
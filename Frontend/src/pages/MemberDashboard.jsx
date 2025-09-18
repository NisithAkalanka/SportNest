// src/pages/MemberDashboard.jsx (සම්පූර්ණ, අවසාන සහ නිවැරදි කේතය)

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/MemberAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const MemberDashboard = () => {
    const { user, login, logout } = useContext(AuthContext); 
    const navigate = useNavigate();
    
    // States
    const [profileData, setProfileData] = useState(null);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            if (!token) { logout(); navigate('/login'); return; }
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('/api/members/my-profile', config);
                setProfileData(data);
                setFormData({
                    firstName: data.memberDetails.firstName,
                    lastName: data.memberDetails.lastName,
                    email: data.memberDetails.email,
                });
            } catch (err) {
                setError('Failed to fetch profile data.');
                if (err.response?.status === 401) { logout(); navigate('/login'); }
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [navigate, logout]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true); setError(''); setSuccess('');
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            if(!token) throw new Error("Token not found!");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.put('/api/members/my-profile', formData, config);
            setSuccess('Your profile has been updated successfully!');
            login(data); // LocalStorage එක සහ Context එක අලුත් data වලින් update කරනවා
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred. Please try again.");
        } finally {
            setSaving(false);
        }
    };
    
    if (loading) return <div>Loading Profile...</div>;
    if (error && !profileData) return <div className="text-red-500">{error}</div>;

    return (
        <div className="container mx-auto max-w-5xl p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-8">My Profile</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* ★★★ Personal Information Form එක සහිත, සම්පූර්ණ කරන ලද වම් කොටස ★★★ */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your personal details here.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleProfileUpdate}>
                            <CardContent className="space-y-6">
                                {error && (
                                    <div className="bg-red-100 text-red-700 p-3 rounded flex items-center">
                                       <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" /> {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="bg-green-100 text-green-700 p-3 rounded flex items-center">
                                       <FontAwesomeIcon icon={faCheckCircle} className="mr-2" /> {success}
                                    </div>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     <div className="space-y-1">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
                                     </div>
                                     <div className="space-y-1">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
                                     </div>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                                </div>
                            </CardContent>
                            <CardFooter>
                                 <Button type="submit" disabled={saving} style={{ backgroundColor: '#FF6700' }}>
                                   {saving && <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />}
                                   {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>

                {/* --- දකුණු පැත්ත: Sport Registrations List --- */}
                <div className="lg:col-span-1">
                     <Card>
                        <CardHeader><CardTitle>My Sport Registrations</CardTitle></CardHeader>
                        <CardContent>
                            {profileData?.playerProfiles && profileData.playerProfiles.length > 0 ? (
                                <ul className="space-y-3">
                                    {profileData.playerProfiles.map(p => (
                                        <li key={p._id} className="text-gray-800 bg-gray-100 p-3 rounded-md">{p.sportName} <span className="text-gray-500 text-sm">({p.skillLevel})</span></li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center p-4 border-2 border-dashed rounded-lg">
                                    <p className="text-gray-600">No sport registrations found.</p>
                                    <Link to="/sports">
                                        <Button variant="link" className="mt-2">Register for a Sport</Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
export default MemberDashboard;
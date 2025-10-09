// src/pages/MemberDashboard.jsx — UPGRADED UI (polished, responsive)

import React, { useState, useEffect, useContext, useRef } from 'react';
import api from '@/api';
import { AuthContext } from '@/context/MemberAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
  faPenToSquare,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import PlayerEditModal from '../components/PlayerEditModal';
import MyEventsInline from '@/components/profile/MyEventsInline';
import OrderHistory from '../components/OrderHistory';

const MemberDashboard = () => {
  const { user, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    age: '',
    nic: '',
    gender: 'Male',
  });

  const [memberDetails, setMemberDetails] = useState(null);
  const [profileImage, setProfileImage] = useState('/uploads/default-avatar.png');
  const [newImageFile, setNewImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sportRegistrations, setSportRegistrations] = useState([]);
  const [editingProfile, setEditingProfile] = useState(null);

  // ==== Resolve image URL (supports absolute URLs, blobs, and server-relative paths) ====
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002';
  const resolveImageSrc = (src) => {
    if (!src) return `${API_BASE}/uploads/default-avatar.png`;
    if (src.startsWith('blob:') || src.startsWith('http://') || src.startsWith('https://')) return src;
    return `${API_BASE}${src.startsWith('/') ? src : `/${src}`}`;
  };

  // ================== Fetch Profile ==================
  const fetchProfileData = async () => {
    if (!user?.token) {
      if (logout) logout();
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.get('/members/my-profile');

      setMemberDetails(data.memberDetails);
      const { memberDetails: md, playerProfiles } = data;

      const initialData = {
        firstName: md?.firstName || '',
        lastName: md?.lastName || '',
        email: md?.email || '',
        contactNumber: md?.contactNumber || '',
        age: md?.age || '',
        nic: md?.nic || '',
        gender: md?.gender || 'Male',
        profileImage: data.memberDetails.profileImage || '/uploads/default-avatar.png',
      };

      setFormData(initialData);
      setOriginalData(initialData);
      setProfileImage(initialData.profileImage);
      setSportRegistrations(playerProfiles || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch profile data.');
      if (err.response?.status === 401) {
        if (logout) logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ================== Handlers ==================
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const updateData = new FormData();
    Object.keys(formData).forEach((key) => updateData.append(key, formData[key]));
    if (newImageFile) updateData.append('profileImage', newImageFile);

    try {
      const { data } = await api.put('/members/my-profile', updateData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (login) login(data);
      setSuccess('Profile updated successfully!');
      setOriginalData({ ...formData, profileImage: data.profileImage });
      setProfileImage(data.profileImage);
      setNewImageFile(null);
      setIsEditing(false);
      await fetchProfileData();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = () => setIsEditing(true);

  const handleCancelClick = () => {
    if (originalData) {
      setFormData(originalData);
      setProfileImage(originalData.profileImage);
    }
    setNewImageFile(null);
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleCancelMembership = async () => {
    if (window.confirm('Are you sure you want to cancel your membership? This cannot be undone.')) {
      try {
        const { data } = await api.delete('/members/membership');
        if (login) login(data);
        alert('Your membership has been successfully cancelled.');
        fetchProfileData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to cancel membership.');
      }
    }
  };

  const handleDeleteSport = async (profileId) => {
    if (window.confirm('Are you sure you want to delete this sport registration?')) {
      try {
        await api.delete(`/players/profile/${profileId}`);
        alert('Registration deleted successfully!');
        setSportRegistrations((prev) => prev.filter((p) => p._id !== profileId));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete registration.');
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (window.confirm('Are you sure you want to remove your profile photo?')) {
      setSaving(true);
      setError('');
      setSuccess('');
      try {
        const { data } = await api.delete('/members/my-profile/photo');
        if (login) login(data);
        setProfileImage(data.profileImage);
        setOriginalData((prev) => ({ ...prev, profileImage: data.profileImage }));
        setSuccess('Profile photo removed successfully!');
        setIsEditing(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to remove photo.');
      } finally {
        setSaving(false);
      }
    }
  };

  // ================== Render ==================
  if (loading)
    return (
      <div className="min-h-[60vh] grid place-content-center">
        <FontAwesomeIcon icon={faSpinner} className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Decorative background accents */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-16 -right-16 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
      </div>

      {editingProfile && (
        <PlayerEditModal
          profile={editingProfile}
          onClose={() => setEditingProfile(null)}
          onUpdate={() => {
            setEditingProfile(null);
            fetchProfileData();
          }}
        />
      )}

      <div className="container mx-auto max-w-7xl p-4 md:p-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl mb-8 bg-[#0D1B2A] text-white ring-1 ring-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(40rem_20rem_at_120%_-10%,rgba(16,185,129,0.25),transparent),radial-gradient(36rem_16rem_at_-10%_120%,rgba(249,115,22,0.25),transparent)]" />
          <div className="relative p-6 md:p-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">My Profile</h1>
              <p className="text-white/80 mt-1">Manage your details, membership and sport registrations.</p>
            </div>
            <div className="hidden sm:flex gap-2">
              <Link to="/sports"><Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">Register Sport</Button></Link>
              <Link to="/events"><Button className="bg-emerald-600 hover:bg-emerald-700 text-white">See Events</Button></Link>
            </div>
          </div>
        </div>

        {/* Membership Expired Reminder */}
        {memberDetails?.membershipStatus === 'Expired' && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-8 shadow-sm" role="alert">
            <p className="font-semibold">Your Membership Has Expired!</p>
            <p className="mt-1 text-sm">Please renew your membership to continue enjoying our services without interruption.</p>
            <Link to="/renew-membership" className="inline-block mt-3 bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 transition-colors">Renew Now</Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Side */}
          <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-24 self-start">
            <Card className="text-center shadow-md ring-1 ring-slate-200/60">
              <CardContent className="p-6">
                <div className="relative w-36 h-36 mx-auto mb-4">
                  {/* shimmering ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-300/40 to-orange-300/40 blur-md" />
                  <img
                    src={resolveImageSrc(profileImage)}
                    alt="Profile"
                    className="relative w-full h-full rounded-full object-cover border-4 border-white shadow-md"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `${API_BASE}/uploads/default-avatar.png`;
                    }}
                  />
                  {isEditing && (
                    <button
                      type="button"
                      className="absolute inset-0 bg-black/0 hover:bg-black/40 rounded-full grid place-content-center transition"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Change profile photo"
                    >
                      <FontAwesomeIcon icon={faPenToSquare} className="text-white text-3xl" />
                    </button>
                  )}
                </div>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" disabled={!isEditing} />
                <h2 className="text-2xl font-bold">{formData.firstName} {formData.lastName}</h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <hr className="my-4" />
                <div className="text-left space-y-2 px-2">
                  <p className="flex justify-between text-sm"><span className="font-semibold text-gray-600">Club ID:</span> <span>{user?.clubId}</span></p>
                  <p className="flex justify-between text-sm"><span className="font-semibold text-gray-600">Role:</span> <span className="capitalize">{user?.role}</span></p>
                </div>

                {isEditing && originalData?.profileImage !== '/uploads/default-avatar.png' && (
                  <Button variant="link" className="text-red-500 mt-2" onClick={handleRemovePhoto} disabled={saving}>
                    <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />
                    Remove Photo
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-md ring-1 ring-slate-200/60">
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
                <CardDescription>Jump to the most common tasks.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Link to="/sports"><Button variant="outline" className="justify-center">Register Sport</Button></Link>
                <Link to="/membership-plans"><Button variant="outline" className="justify-center">Membership</Button></Link>
                <Link to="/events"><Button className="bg-emerald-600 hover:bg-emerald-700 text-white justify-center">Events</Button></Link>
                <Link to="/shop"><Button className="bg-orange-500 hover:bg-orange-600 text-white justify-center">Shop</Button></Link>
              </CardContent>
            </Card>
          </div>

          {/* Right Side */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Info */}
            <Card className="shadow-md ring-1 ring-slate-200/60">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  {isEditing ? "You are now editing your details. Click 'Save Changes' when you are done." : "View your personal details. Click 'Edit Profile' to make changes."}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleProfileUpdate}>
                <CardContent className="space-y-6">
                  {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 flex items-center">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" /> {error}
                    </div>
                  )}
                  {success && !isEditing && (
                    <div className="bg-green-50 text-green-700 p-3 rounded-md border border-green-200 flex items-center">
                      <FontAwesomeIcon icon={faCheckCircle} className="mr-2" /> {success}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1"><Label htmlFor="firstName">First Name</Label><Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required disabled={!isEditing} /></div>
                    <div className="space-y-1"><Label htmlFor="lastName">Last Name</Label><Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required disabled={!isEditing} /></div>
                  </div>
                  <div className="space-y-1"><Label htmlFor="email">Email Address</Label><Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required disabled={!isEditing} /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1"><Label htmlFor="nic">NIC Number</Label><Input id="nic" name="nic" value={formData.nic} onChange={handleChange} required disabled={!isEditing} /></div>
                    <div className="space-y-1"><Label htmlFor="contactNumber">Contact Number</Label><Input id="contactNumber" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required disabled={!isEditing} /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1"><Label htmlFor="age">Age</Label><Input id="age" name="age" type="number" value={formData.age} onChange={handleChange} required disabled={!isEditing} /></div>
                    <div className="space-y-1">
                      <Label htmlFor="gender">Gender</Label>
                      <select name="gender" value={formData.gender} onChange={handleChange} disabled={!isEditing} className={`w-full mt-1 p-2 border rounded-md bg-transparent ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-4">
                  {isEditing ? (
                    <>
                      <Button type="button" variant="ghost" onClick={handleCancelClick}>Cancel</Button>
                      <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        {saving && <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />}{saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </>
                  ) : (
                    <Button type="button" onClick={handleEditClick} className="bg-emerald-600 hover:bg-emerald-700 text-white">Edit Profile</Button>
                  )}
                </CardFooter>
              </form>
            </Card>

            {/* Membership Details */}
            <Card className="shadow-md ring-1 ring-slate-200/60">
              <CardHeader>
                <CardTitle>Membership Details</CardTitle>
                <CardDescription>Your current membership information.</CardDescription>
              </CardHeader>
              <CardContent>
                {memberDetails && memberDetails.membershipId ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center"><p className="text-sm font-medium text-gray-500">Membership ID</p><p className="font-semibold text-gray-800">{memberDetails.membershipId}</p></div>
                    <div className="flex justify-between items-center"><p className="text-sm font-medium text-gray-500">Current Plan</p><p className="font-semibold">{memberDetails.membershipPlan}</p></div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${memberDetails.membershipStatus === 'Active' ? 'bg-green-100 text-green-800' : memberDetails.membershipStatus === 'Expired' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                        {memberDetails.membershipStatus}
                      </span>
                    </div>
                    {memberDetails.membershipExpiresAt && (
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-500">Expires On</p>
                        <p className="font-semibold text-gray-800">{new Date(memberDetails.membershipExpiresAt).toLocaleDateString()}</p>
                      </div>
                    )}
                    <div className="flex justify-end gap-4 pt-4 border-t">
                      <Link to="/membership-plans"><Button variant="outline">Switch Plan</Button></Link>
                      <Button variant="destructive" onClick={handleCancelMembership}>Cancel Membership</Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 border-2 border-dashed rounded-xl bg-white">
                    <p className="text-gray-600">You don't have an active membership plan yet.</p>
                    <Link to="/membership-plans"><Button variant="link" className="mt-2">Choose a Plan</Button></Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Sport Registrations */}
            <Card className="shadow-md ring-1 ring-slate-200/60">
              <CardHeader><CardTitle>My Sport Registrations</CardTitle></CardHeader>
              <CardContent>
                {sportRegistrations && sportRegistrations.length > 0 ? (
                  <ul className="space-y-3">
                    {sportRegistrations.map((p) => (
                      <li key={p._id} className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center hover:shadow-sm transition">
                        <div className="flex items-center gap-3">
                          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                          <div>
                            <div className="font-semibold">{p.sportName}</div>
                            <div className="text-gray-500 text-xs">Skill: {p.skillLevel || '—'}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingProfile(p)}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteSport(p._id)}>Delete</Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center p-6 border-2 border-dashed rounded-xl bg-white">
                    <p className="text-gray-600">No sport registrations found.</p>
                    <Link to="/sports"><Button variant="link" className="mt-2">Register for a Sport</Button></Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Club Review CTA */}
            <Card className="shadow-md ring-1 ring-slate-200/60">
              <CardHeader>
                <CardTitle>Club Review</CardTitle>
                <CardDescription>Your feedback is valuable to us. Share or update your experience on our official reviews page.</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link to="/reviews">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Go to Reviews Page</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Order History & Refunds */}
            <Card className="shadow-md ring-1 ring-slate-200/60">
              <CardHeader>
                <CardTitle>Order History & Refunds</CardTitle>
                <CardDescription>View your order history and manage refund requests.</CardDescription>
              </CardHeader>
              <CardContent>
                <OrderHistory />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Inline list of my submitted events */}
        <div className="mt-10">
          <MyEventsInline />
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
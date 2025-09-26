// File: frontend/src/pages/MemberDashboard.jsx (FINAL FULL VERSION)

import React, { useState, useEffect, useContext, useRef } from 'react';
import api from '../api/axiosConfig'; // ✅ shared axios instance with interceptors
import { AuthContext } from '../context/MemberAuthContext';
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
} from '@fortawesome/free-solid-svg-icons';
import PlayerEditModal from '../components/PlayerEditModal';

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
    gender: '',
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

  // ================== Fetch Profile ==================
  const fetchProfileData = async () => {
    if (!user?.token) {
      logout();
      navigate('/login');
      return;
    }
    try {
      const { data } = await api.get('/members/my-profile');

      setMemberDetails(data.memberDetails);

      const { playerProfiles } = data;

      const initialData = {
        firstName: data.memberDetails.firstName || '',
        lastName: data.memberDetails.lastName || '',
        email: data.memberDetails.email || '',
        contactNumber: data.memberDetails.contactNumber || '',
        age: data.memberDetails.age || '',
        nic: data.memberDetails.nic || '',
        gender: data.memberDetails.gender || 'Male',
        profileImage:
          data.memberDetails.profileImage || '/uploads/default-avatar.png',
      };
      setFormData(initialData);
      setOriginalData(initialData);
      setProfileImage(initialData.profileImage);
      setSportRegistrations(playerProfiles);
    } catch (err) {
      setError('Failed to fetch profile data.');
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user, navigate, logout]);

  // ================== Handlers ==================
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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
    Object.keys(formData).forEach((key) =>
      updateData.append(key, formData[key])
    );
    if (newImageFile) {
      updateData.append('profileImage', newImageFile);
    }

    try {
      const { data } = await api.put('/members/my-profile', updateData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      login(data);
      setSuccess('Profile updated successfully!');
      setOriginalData({ ...formData, profileImage: data.profileImage });
      setProfileImage(data.profileImage);
      setNewImageFile(null);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = () => setIsEditing(true);

  const handleCancelClick = () => {
    setFormData(originalData);
    setProfileImage(originalData.profileImage);
    setNewImageFile(null);
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleCancelMembership = async () => {
    if (window.confirm('Are you sure you want to cancel your membership? This cannot be undone.')) {
      try {
        const { data } = await api.delete('/members/membership');
        login(data);
        alert('Your membership has been successfully cancelled.');
        fetchProfileData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to cancel membership.');
      }
    }
  };

  // ✅ Updated Delete Sport Registration
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

  // ================== Render ==================
  if (loading) return <div>Loading Profile...</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
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
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        {/* Membership Expired Reminder */}
        {memberDetails?.membershipStatus === 'Expired' && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-8 shadow-md"
            role="alert"
          >
            <p className="font-bold text-lg">Your Membership Has Expired!</p>
            <p className="mt-1">
              Please renew your membership to continue enjoying our services without
              interruption.
            </p>
            <Link
              to="/renew-membership"
              className="inline-block mt-3 bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition-colors"
            >
              Renew Now
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Side */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="text-center sticky top-8">
              <CardContent className="p-6">
                <div className="relative w-36 h-36 mx-auto mb-4 group">
                  <img
                    src={
                      profileImage.startsWith('blob:')
                        ? profileImage
                        : `http://localhost:5002${profileImage}`
                    }
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
                  />
                  {isEditing && (
                    <div
                      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full cursor-pointer transition-all"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <FontAwesomeIcon
                        icon={faPenToSquare}
                        className="text-white text-3xl opacity-0 group-hover:opacity-100"
                      />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={!isEditing}
                />
                <h2 className="text-2xl font-bold">
                  {formData.firstName} {formData.lastName}
                </h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <hr className="my-4" />
                <div className="text-left space-y-2 px-2">
                  <p className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-600">Club ID:</span>{' '}
                    <span>{user?.clubId}</span>
                  </p>
                  <p className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-600">Role:</span>{' '}
                    <span className="capitalize">{user?.role}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  {isEditing
                    ? "You are now editing your details. Click 'Save Changes' when you are done."
                    : "View your personal details. Click 'Edit Profile' to make changes."}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleProfileUpdate}>
                <CardContent className="space-y-6">
                  {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded flex items-center">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />{' '}
                      {error}
                    </div>
                  )}
                  {success && !isEditing && (
                    <div className="bg-green-100 text-green-700 p-3 rounded flex items-center">
                      <FontAwesomeIcon icon={faCheckCircle} className="mr-2" /> {success}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="nic">NIC Number</Label>
                      <Input
                        id="nic"
                        name="nic"
                        value={formData.nic}
                        onChange={handleChange}
                        required
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="contactNumber">Contact Number</Label>
                      <Input
                        id="contactNumber"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        required
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        value={formData.age}
                        onChange={handleChange}
                        required
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full mt-1 p-2 border rounded-md bg-transparent ${
                          !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                      >
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-4">
                  {isEditing ? (
                    <>
                      <Button type="button" variant="ghost" onClick={handleCancelClick}>
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={saving}
                        style={{ backgroundColor: '#FF6700' }}
                      >
                        {saving && (
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                        )}
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleEditClick}
                      style={{ backgroundColor: '#FF6700' }}
                    >
                      Edit Profile
                    </Button>
                  )}
                </CardFooter>
              </form>
            </Card>

            {/* Membership Details */}
            <Card>
              <CardHeader>
                <CardTitle>Membership Details</CardTitle>
                <CardDescription>
                  Your current membership information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {memberDetails && memberDetails.membershipId ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-500">Membership ID</p>
                      <p className="font-semibold text-gray-800">
                        {memberDetails.membershipId}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-500">Current Plan</p>
                      <p className="font-semibold">{memberDetails.membershipPlan}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${
                          memberDetails.membershipStatus === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : memberDetails.membershipStatus === 'Expired'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {memberDetails.membershipStatus}
                      </span>
                    </div>
                    {memberDetails.membershipExpiresAt && (
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-500">Expires On</p>
                        <p className="font-semibold text-gray-800">
                          {new Date(
                            memberDetails.membershipExpiresAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <div className="flex justify-end gap-4 pt-4 border-t">
                      <Link to="/membership-plans">
                        <Button variant="outline">Switch Plan</Button>
                      </Link>
                      <Button variant="destructive" onClick={handleCancelMembership}>
                        Cancel Membership
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 border-2 border-dashed rounded-lg">
                    <p className="text-gray-600">
                      You don't have an active membership plan yet.
                    </p>
                    <Link to="/membership-plans">
                      <Button variant="link" className="mt-2">
                        Choose a Plan
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Sport Registrations */}
            <Card>
              <CardHeader>
                <CardTitle>My Sport Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                {sportRegistrations && sportRegistrations.length > 0 ? (
                  <ul className="space-y-3">
                    {sportRegistrations.map((p) => (
                      <li
                        key={p._id}
                        className="bg-gray-100 p-3 rounded-md flex justify-between items-center"
                      >
                        <div>
                          <span className="font-semibold">{p.sportName}</span>
                          <span className="text-gray-500 text-sm ml-2">
                            ({p.skillLevel})
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingProfile(p)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteSport(p._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center p-4 border-2 border-dashed rounded-lg">
                    <p className="text-gray-600">No sport registrations found.</p>
                    <Link to="/sports">
                      <Button variant="link" className="mt-2">
                        Register for a Sport
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;

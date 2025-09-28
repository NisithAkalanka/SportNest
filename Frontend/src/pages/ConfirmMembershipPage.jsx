

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/MemberAuthContext';
import { FaEdit } from 'react-icons/fa';

const allPlans = [
    { name: 'Student Membership', price: '20,000 LKR', period: '/ year' },
    { name: 'Ordinary Membership', price: '60,000 LKR', period: '/ year' },
    { name: 'Life Time Membership', price: '100,000 LKR', period: '/ lifetime' } 
];

const ConfirmMembershipPage = () => {
    const { planName } = useParams();
    const navigate = useNavigate();
    const { user, login } = useContext(AuthContext);

    const [selectedPlan, setSelectedPlan] = useState(null);
    const [formData, setFormData] = useState({ clubId: '', fullName: '', email: '' });
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    useEffect(() => {
        if (!user) {
            alert("Please log in to select a membership plan.");
            navigate('/login');
            return;
        }
        const decodedPlanName = decodeURIComponent(planName);
        const planDetails = allPlans.find(p => p.name === decodedPlanName);
        if (planDetails) setSelectedPlan(planDetails);
        
        setFormData({
            clubId: user.clubId || '', 
            fullName: (user.firstName && user.lastName) ? `${user.firstName} ${user.lastName}` : '',
            email: user.email || ''
        });
    }, [planName, user, navigate]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handlePlanChange = (newPlan) => {
        setSelectedPlan(newPlan);
        navigate(`/confirm-membership/${encodeURIComponent(newPlan.name)}`, { replace: true });
        setIsDropdownOpen(false);
    };
    const handleGoBack = () => navigate('/membership-plans');
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = userInfo?.token;

            if (!token) {
                alert('Authentication Token not found. Please log in again.');
                navigate('/login'); return;
            }

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const subscriptionData = { clubId: formData.clubId, planName: selectedPlan.name };
            
            const { data: updatedUserData } = await axios.post('/api/members/subscribe', subscriptionData, config);
            login(updatedUserData);

            navigate('/subscription-success', { 
                state: { 
                    planName: updatedUserData.membershipPlan, 
                    membershipId: updatedUserData.membershipId 
                } 
            });

        } catch (error) {
            console.error("Subscription failed:", error);
            alert(error.response?.data?.message || "Subscription failed. Please try again.");
        }
    };

    if (!selectedPlan || !user) return <div>Loading...</div>;

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-center mb-2">Confirm Your Details</h1>
                    <p className="text-gray-600 mb-8">You've chosen a plan! Please verify your auto-filled details. You can change your selected plan before confirming.</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="bg-blue-50 p-6 rounded-lg mb-6 border border-blue-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Selected Plan</label>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-blue-900">{selectedPlan.name}</h3>
                                <p className="text-2xl font-extrabold">{selectedPlan.price}<span className="text-base font-normal text-gray-600">{selectedPlan.period}</span></p>
                            </div>
                            <div className="relative">
                                <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <FaEdit /> Change
                                </button>
                                {isDropdownOpen && (
                                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border">
                                    {allPlans.map(plan => (
                                      plan.name !== selectedPlan.name && (
                                        <a key={plan.name} onClick={() => handlePlanChange(plan)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">{plan.name}</a>
                                      )
                                    ))}
                                  </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Club ID</label>
                            <input type="text" name="clubId" value={formData.clubId} onChange={handleChange} placeholder="Enter Your Club ID" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                           <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter Your Full Name" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                         <div className="md:col-span-2">
                           <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input type="email" value={formData.email} readOnly className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm cursor-not-allowed"/>
                        </div>
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row gap-4 mt-8">
                        <button type="button" onClick={handleGoBack} className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors">Leave (Back to Plans)</button>
                        <button type="submit" className="flex-grow px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors">Confirm & Subscribe</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConfirmMembershipPage;

// src/pages/RenewMembershipPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/MemberAuthContext';
import MembershipRenewalPaymentForm from '../components/MembershipRenewalPaymentForm';

const RenewMembershipPage = () => {
    const { state } = useLocation(); 
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    // ★★★ formData හි ආරම්භක අගයන් හිස්ව තැබීම ★★★
    const [formData, setFormData] = useState({
        membershipId: '',
        fullName: '',
        email: '',
        currentPlan: '',
        newPlan: ''
    });
    
    const [pageLoading, setPageLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showPaymentForm, setShowPaymentForm] = useState(false);

    useEffect(() => {
        // ★★★ දත්ත ලබා ගැනීමේ වඩාත් ස්ථාවර ක්‍රමය ★★★
        const fetchMemberDetails = async () => {
            if (!user) {
                navigate('/login');
                return;
            }
            try {
                // API call එකක් මගින් profile විස්තර ලබා ගැනීම
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get('/api/members/my-profile', config);

                const memberDetails = data.memberDetails || {};
                const membershipId = memberDetails.membershipId || user.membershipId;
                const currentPlan = memberDetails.membershipPlan || user.membershipPlan;
                
                if (!membershipId) {
                     setError("Could not find an active membership ID for your profile.");
                     setPageLoading(false);
                     return;
                }

                setFormData({
                    membershipId: membershipId,
                    currentPlan: currentPlan,
                    newPlan: currentPlan || 'Ordinary Membership',
                    fullName: `${memberDetails.firstName || ''} ${memberDetails.lastName || ''}`.trim(),
                    email: memberDetails.email || '',
                });
            } catch (err) {
                setError('Failed to fetch your membership details. Please try again.');
            } finally {
                setPageLoading(false);
            }
        };

        // dashboard එකෙන් state එක ලැබුනොත් එය භාවිතා කිරීම (වේගවත් නිසා)
        if (state?.membershipId) {
            setFormData(prev => ({
                ...prev,
                membershipId: state.membershipId,
                currentPlan: state.currentPlan,
                newPlan: state.currentPlan,
            }));
            // State එකෙන් දත්ත ලැබුනත්, full name සහ email ලබාගැනීමට API call එක යැවීම
            fetchMemberDetails();
        } else if (user) {
            // State එක නොමැතිනම් (උදා: පිටුව refresh කළ විට) API call එකෙන් සියල්ල ලබා ගැනීම
            fetchMemberDetails();
        } else {
            navigate('/login');
        }
    }, [state, user, navigate]);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ★★★ `handleSubmit` function එක payment form එකට යොමු වන සේ වෙනස් කරන ලදී ★★★
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate form
        if (!formData.newPlan) {
            setError('Please select a new plan');
            return;
        }

        // Show payment form instead of directly processing
        setShowPaymentForm(true);
    };

    const handlePaymentSuccess = (paymentData) => {
        // Navigate to success page with payment details
        navigate('/renewal-success', {
            state: {
                membershipData: formData,
                paymentData: paymentData,
                paymentCompleted: true
            }
        });
    };

    const handlePaymentError = (errorMessage) => {
        console.error('Payment error:', errorMessage);
        setError(errorMessage);
        setShowPaymentForm(false);
    };

    const handlePaymentCancel = () => {
        setShowPaymentForm(false);
    };
    
    if (pageLoading) {
        return <div className="text-center p-20 font-semibold text-lg">Loading Membership Details...</div>;
    }

    // Show payment form if user has proceeded to payment
    if (showPaymentForm) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <MembershipRenewalPaymentForm
                    membershipData={formData}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    onCancel={handlePaymentCancel}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Renew Membership</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">Confirm your details and choose your new plan.</p>
                </div>

                {!formData.membershipId ? (
                     <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
                        <p>{error || "No active membership found to renew."}</p>
                     </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && <p className="text-red-500 text-center bg-red-50 p-3 rounded-lg">{error}</p>}
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Membership ID</label>
                            <input type="text" value={formData.membershipId} readOnly className="w-full mt-1 p-2 border rounded-md bg-gray-100 cursor-not-allowed"/>
                        </div>
                        
                        {/* ★★★ Full Name සහ Email ස්වයංක්‍රීයව පිරී, වෙනස් කළ නොහැකි ලෙස සකස් කරන ලදී ★★★ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input name="fullName" type="text" value={formData.fullName} readOnly className="w-full mt-1 p-2 border rounded-md bg-gray-100 cursor-not-allowed"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input name="email" type="email" value={formData.email} readOnly className="w-full mt-1 p-2 border rounded-md bg-gray-100 cursor-not-allowed"/>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Your Current Plan</label>
                            <input type="text" value={formData.currentPlan} readOnly className="w-full mt-1 p-2 border rounded-md bg-gray-100 cursor-not-allowed"/>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Select New Plan</label>
                            <select name="newPlan" value={formData.newPlan} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md">
                                <option value="">Select a plan</option>
                                <option value="Student Membership">Student Membership - Rs. 20,000</option>
                                <option value="Ordinary Membership">Ordinary Membership - Rs. 60,000</option>
                                <option value="Life Membership">Life Membership - Rs. 100,000</option>
                                <option value="Life Time Membership">Life Time Membership - Rs. 100,000</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 border rounded-md font-medium text-gray-700 hover:bg-gray-50">Back</button>
                            <button type="submit" disabled={!formData.newPlan} className="px-6 py-2 border rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                                Proceed to Payment
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default RenewMembershipPage;
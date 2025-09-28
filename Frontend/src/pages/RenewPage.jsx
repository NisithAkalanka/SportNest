

import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/MemberAuthContext';

const RenewMembershipPage = () => {
    const { state } = useLocation(); 
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    //  formData eke data hiswa tabima
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

    useEffect(() => {
        //  data laba ganime sthawara kramaya
        const fetchMemberDetails = async () => {
            if (!user) {
                navigate('/login');
                return;
            }
            try {
                // API call ekak magin profile data labaganima
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

        // if receive any data from state, use it to pre-fill the form
        if (state?.membershipId) {
            setFormData(prev => ({
                ...prev,
                membershipId: state.membershipId,
                currentPlan: state.currentPlan,
                newPlan: state.currentPlan,
            }));
            // Also fetch other details from API to ensure up-to-date info
            fetchMemberDetails();
        } else if (user) {
            // No state data, but user is logged in - fetch details from API
            fetchMemberDetails();
        } else {
            navigate('/login');
        }
    }, [state, user, navigate]);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // redirect to RenewalSuccessPage after successful submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const submissionData = { newPlan: formData.newPlan };

            await axios.post('/api/members/renew', submissionData, config);

            // if successful, redirect to success page
            navigate('/renewal-success');

        } catch (err)
 {
            setError(err.response?.data?.message || 'An error occurred during renewal.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (pageLoading) {
        return <div className="text-center p-20 font-semibold text-lg">Loading Membership Details...</div>;
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
                        
                        {/*set validations*/}
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
                                <option>Student Membership</option>
                                <option>Ordinary Membership</option>
                                <option>Life Membership</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 border rounded-md font-medium text-gray-700 hover:bg-gray-50">Back</button>
                            <button type="submit" disabled={isSubmitting} className="px-6 py-2 border rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                                {isSubmitting ? 'Processing...' : 'Proceed'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default RenewMembershipPage;
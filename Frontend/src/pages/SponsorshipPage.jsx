// frontend/src/pages/SponsorshipPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaTrophy, FaCheckCircle, FaDownload } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const sponsorshipPlans = [
    { name: 'Silver', price: 50000, features: ['Logo on our website', 'Social media shout-out', '2 event passes'] },
    { name: 'Gold', price: 100000, features: ['All Silver benefits', 'Banner at one event', 'Logo on team t-shirts'] },
    { name: 'Platinum', price: 250000, features: ['All Gold benefits', 'Main event sponsorship', 'Banner at all events'] }
];

const SponsorshipPage = () => {
    const navigate = useNavigate();
    const pdfContentRef = useRef(null);//
    
    const [formData, setFormData] = useState({
        fullName: '',
        organizationName: '',
        contactPerson: '',
        email: '',
        phoneNumber: '',
        address: '',
        sponsorshipPlan: 'Silver',
        sponsorshipAmount: 50000,
        startDate: '',
        endDate: '',
        agreedToTerms: false,
        agreedToLogoUsage: false
    });
    
    const [errors, setErrors] = useState({});
    const [manageableApp, setManageableApp] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        const savedAppData = localStorage.getItem('sponsorshipApplication');
        if (savedAppData) {
            setManageableApp(JSON.parse(savedAppData));
        }
    }, []);

    const validateField = (name, value) => {
        switch (name) {
            case 'fullName':
            case 'organizationName':
            case 'contactPerson':
                const nameRegex = /^[A-Za-z\s]+$/;
                return nameRegex.test(value) ? '' : 'This field must contain only letters and spaces.';
            
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value) ? '' : 'Please enter a valid email address (e.g., user@domain.com).';

            case 'phoneNumber':
                const phoneRegex = /^(0\d{9}|\+94\d{9})$/;
                return phoneRegex.test(value) ? '' : 'Invalid phone number (e.g., 0771234567 or +94771234567).';
            
            case 'address':
                return value.length <= 50 ? '' : 'Address cannot be longer than 50 characters.';
            
            case 'startDate':
                const minStartDate = new Date('2025-09-01T00:00:00Z');
                const selectedStartDate = new Date(value);
                return selectedStartDate >= minStartDate ? '' : 'Start date must be on or after September 1, 2025.';

            case 'endDate':
                 if (!formData.startDate) return '';
                 const startDateForEndCheck = new Date(formData.startDate);
                 const selectedEndDate = new Date(value);
                 return selectedEndDate > startDateForEndCheck ? '' : 'End date must be after the start date.';

            default:
                return '';
        }
    };
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: newValue }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const errorMessage = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: errorMessage }));
    };

    const handlePlanSelect = (plan) => {
        setFormData(prev => ({ ...prev, sponsorshipPlan: plan.name, sponsorshipAmount: plan.price }));
        document.getElementById('sponsorship-form').scrollIntoView({ behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const validationErrors = {};
        Object.keys(formData).forEach(name => {
            if (name !== 'LastName') { // 'LastName' field is not in the state, so skip it.
                const errorMessage = validateField(name, formData[name]);
                if (errorMessage) {
                    validationErrors[name] = errorMessage;
                }
            }
        });
        
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setError('Please correct the errors highlighted below.');
            return;
        }

        if (!formData.agreedToTerms || !formData.agreedToLogoUsage) {
            setError('Please agree to the terms and conditions and logo usage.');
            return;
        }
        
        setIsSubmitting(true);

        try {
            const response = await axios.post('/api/sponsorships', formData);
            const { sponsorshipId, accessToken, message } = response.data;
            const appData = { id: sponsorshipId, token: accessToken };
            localStorage.setItem('sponsorshipApplication', JSON.stringify(appData));
            setManageableApp(appData);
            setSuccess(message || 'Application submitted successfully! Redirecting...');
            setTimeout(() => {
                navigate(`/sponsorship/manage/${sponsorshipId}?token=${accessToken}`);
            }, 2000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to submit application. Please check the form and try again.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDownloadPDF = () => {       //
        const input = pdfContentRef.current;
        if (!input) return;
        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save("Sponsorship-Details-SportNest.pdf");
        });
    };

    return (
        <div className="bg-gray-100">
            <div className="container mx-auto py-16 px-4">

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Partner with Us</h1>
                    <p className="text-lg text-gray-600 mt-2">Join us in championing community sports and excellence.</p>
                </div>

                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md mb-16">
                    <div ref={pdfContentRef} className="p-8 sm:p-10">
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-3">Sponsorship Opportunities</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    Partnering with SportNest Sports Club is a rewarding way to promote your brand while making a real difference in the community. As one of the region’s most active and recognized clubs, we organize tournaments, training programs, and community events that attract players, families, and supporters throughout the year. Sponsorship with us is not just financial support—it is an investment in youth development, healthy lifestyles, and long-term community impact.
                                </p>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Requirements for Sponsors</h2>
                                <ul className="space-y-3">
                                    {[ 'A valid company registration or business profile for verification', 'Contact person details including name, designation, phone, and email', 'High-quality brand assets (logo files, brand guidelines, preferred taglines)', 'A clear agreement on the sponsorship duration, chosen package, and payment terms', 'A signed sponsorship form or Memorandum of Understanding (MOU) to confirm the partnership'].map(req => (<li key={req} className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" /><span className="text-gray-700">{req}</span></li>))}
                                </ul>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Benefits of Sponsorship</h2>
                                <ul className="space-y-3">
                                    {[ 'Brand Exposure: Logos featured on team jerseys, event banners, and digital promotions', 'Digital Presence: Regular mentions on our official website and social media pages', 'Event Recognition: Announcements, displays, and branding opportunities during tournaments and community activities', 'Community Engagement: Direct interaction with youth, families, and local audiences through outreach events', 'CSR Value: Positive contribution towards sports, health, and youth empowerment initiatives', 'Exclusive Perks: Complimentary VIP passes, meet-and-greet opportunities, and priority for future partnerships'].map(ben => (<li key={ben} className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" /><span className="text-gray-700">{ben}</span></li>))}
                                </ul>
                            </div>
                            <p className="text-gray-600 leading-relaxed pt-4 border-t mt-8">
                                By sponsoring SportNest, your organization strengthens its brand presence while demonstrating a commitment to community growth and sporting excellence. Together, we can inspire athletes, create memorable experiences, and achieve mutual success.
                            </p>
                        </div>
                    </div>
                    <div className="px-8 sm:px-10 pb-8 border-t pt-6 text-center">
                         <button onClick={handleDownloadPDF} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors">
                            <FaDownload /> Download Sponsorship Details (PDF)
                        </button>
                    </div>
                </div>

                <div className="mb-12"><h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Our Sponsorship Tiers</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-8">{sponsorshipPlans.map(plan=>(<div key={plan.name} className="border-2 p-6 rounded-lg text-center flex flex-col hover:border-indigo-500 hover:shadow-xl transition-all duration-300"><h3 className={`text-2xl font-bold mb-4 ${plan.name==='Gold' ? 'text-yellow-500' :plan.name==='Platinum' ? 'text-gray-700' :'text-gray-400'}`}>{plan.name}</h3><p className="text-4xl font-bold mb-4">{plan.price.toLocaleString()} LKR</p><ul className="text-left space-y-2 flex-grow mb-6">{plan.features.map(feat=><li key={feat} className="flex items-center"><FaTrophy className="text-green-500 mr-2 flex-shrink-0"/> {feat}</li>)}</ul><button onClick={()=>handlePlanSelect(plan)} className="mt-auto bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700">Select {plan.name}</button></div>))}</div></div>
                 {manageableApp && !success && (<div className="text-center mb-8 bg-blue-100 p-4 rounded-lg border border-blue-300"><p className="text-blue-800 mb-2">You have a recent application. Want to manage it?</p><button onClick={()=>navigate(`/sponsorship/manage/${manageableApp.id}?token=${manageableApp.token}`)} className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">Manage My Recent Application</button></div>)}

                   <form onSubmit={handleSubmit} id="sponsorship-form" className="bg-white p-8 rounded-lg shadow-xl border">
                     <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Sponsorship Application Form</h2>
                    {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">{error}</div>}
                    {success && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6">{success}</div>}

                    {!success && <>
                        <fieldset className="border rounded-lg p-4 mb-6">
                            <legend className="font-bold text-lg px-2">1. Sponsorship Information</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-2">
                               <div><input name="fullName" value={formData.fullName} onChange={handleChange} onBlur={handleBlur} placeholder="Full Name *" required className="input-field" /><p className="text-red-500 text-xs mt-1 h-4">{errors.fullName}</p></div>
                               <div><input name="LastName" value={formData.LastName || ''} onChange={handleChange} onBlur={handleBlur} placeholder="LastName *" required className="input-field" /><p className="text-red-500 text-xs mt-1 h-4">{errors.LastName}</p></div>
                               <div><input name="organizationName" value={formData.organizationName} onChange={handleChange} onBlur={handleBlur} placeholder="Organization Name *" required className="input-field" /><p className="text-red-500 text-xs mt-1 h-4">{errors.organizationName}</p></div>
                               <div><input name="contactPerson" value={formData.contactPerson} onChange={handleChange} onBlur={handleBlur} placeholder="Contact Person Name *" required className="input-field" /><p className="text-red-500 text-xs mt-1 h-4">{errors.contactPerson}</p></div>
                               <div><input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} placeholder="Email Address *" required className="input-field" /><p className="text-red-500 text-xs mt-1 h-4">{errors.email}</p></div>
                               <div>
                                    <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} onBlur={handleBlur} placeholder="Phone Number *" required className="input-field" />
                                    <p className="text-red-500 text-xs mt-1 h-4">{errors.phoneNumber}</p>
                               </div>
                               <div className="md:col-span-2">
                                 <input name="address" value={formData.address} onChange={handleChange} onBlur={handleBlur} placeholder="Full Address (Street, City, Country) *" required className="input-field" />
                                 <p className="text-red-500 text-xs mt-1 h-4">{errors.address}</p>
                               </div>
                            </div>
                        </fieldset>
                        
                        <fieldset className="border rounded-lg p-4 mb-6">
                             <legend className="font-bold text-lg px-2">2. Sponsorship Details</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-2">
                                 <div><label className="form-label">Sponsorship Plan *</label><select name="sponsorshipPlan" value={formData.sponsorshipPlan} onChange={handleChange} required className="input-field">{sponsorshipPlans.map(plan => (<option key={plan.name} value={plan.name}>{plan.name} - {plan.price.toLocaleString()} LKR</option>))}</select><p className="h-4"></p></div>
                                 <div><label className="form-label">Amount (LKR)</label><input type="text" value={formData.sponsorshipAmount.toLocaleString()} readOnly className="input-field bg-gray-100"/><p className="h-4"></p></div>
                                 <div><label className="form-label">Sponsorship Start Date *</label><input type="date" name="startDate" value={formData.startDate} onChange={handleChange} onBlur={handleBlur} required className="input-field" min="2025-09-01"/><p className="text-red-500 text-xs mt-1 h-4">{errors.startDate}</p></div>
                                 <div><label className="form-label">Sponsorship End Date *</label><input type="date" name="endDate" value={formData.endDate} onChange={handleChange} onBlur={handleBlur} required className="input-field"/><p className="text-red-500 text-xs mt-1 h-4">{errors.endDate}</p></div>
                            </div>
                        </fieldset>
                        
                        <fieldset className="mb-6"><legend className="font-bold text-lg mb-2">4. Agreement & Conditions</legend><div className="space-y-2 mt-2"><label className="flex items-center"><input type="checkbox" name="agreedToTerms" checked={formData.agreedToTerms} onChange={handleChange} required className="mr-3 h-5 w-5"/> I agree to the terms and conditions.</label><label className="flex items-center"><input type="checkbox" name="agreedToLogoUsage" checked={formData.agreedToLogoUsage} onChange={handleChange} required className="mr-3 h-5 w-5"/> I allow the club to use my brand/logo.</label></div></fieldset>
                        <button type="submit" disabled={isSubmitting} className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400">{isSubmitting ? 'Submitting...' : 'Submit Application'}</button>
                    </>}
                </form>
            </div>
        </div>
    );
};

export default SponsorshipPage;
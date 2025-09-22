// frontend/src/pages/SponsorshipManagePage.jsx

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FaFilePdf } from 'react-icons/fa';

// PDF එකේ පිරිසිදු පෙනුම සඳහා වන නව Component එක
const PDFLayout = React.forwardRef(({ data }, ref) => {
    if (!data) return null;
    return (
        <div ref={ref} className="p-10 bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
            <div className="flex items-center gap-4 pb-4 border-b">
                <FaFilePdf className="text-4xl text-blue-600" />
                <div>
                    <h1 className="text-2xl font-bold">Sponsorship Application Summary</h1>
                    <p className="text-sm text-gray-500">SportNest Club</p>
                </div>
            </div>
            <div className="mt-8 space-y-6">
                <div className="border rounded-lg p-4">
                    <h2 className="font-bold text-lg mb-3">1. Sponsorship Information</h2>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                        <p><strong className="font-medium text-gray-600">Full Name:</strong> {data.fullName}</p>
                        <p><strong className="font-medium text-gray-600">Organization:</strong> {data.organizationName}</p>
                        <p><strong className="font-medium text-gray-600">Contact Person:</strong> {data.contactPerson}</p>
                        <p><strong className="font-medium text-gray-600">Email:</strong> {data.email}</p>
                        <p><strong className="font-medium text-gray-600">Phone:</strong> {data.phoneNumber}</p>
                        <p className="col-span-2"><strong className="font-medium text-gray-600">Address:</strong> {data.address}</p>
                    </div>
                </div>
                 <div className="border rounded-lg p-4">
                    <h2 className="font-bold text-lg mb-3">2. Sponsorship Details</h2>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                        <p><strong className="font-medium text-gray-600">Selected Plan:</strong> {data.sponsorshipPlan}</p>
                        <p><strong className="font-medium text-gray-600">Amount (LKR):</strong> {data.sponsorshipAmount?.toLocaleString()}</p>
                        <p><strong className="font-medium text-gray-600">Start Date:</strong> {new Date(data.startDate).toLocaleDateString()}</p>
                        <p><strong className="font-medium text-gray-600">End Date:</strong> {new Date(data.endDate).toLocaleDateString()}</p>
                    </div>
                </div>
                 <div className="border rounded-lg p-4">
                     <h2 className="font-bold text-lg mb-3">3. Agreement & Conditions</h2>
                    <ul className="list-disc list-inside text-sm">
                        <li>Agreed to terms and conditions: <strong>Yes</strong></li>
                        <li>Agreed to club's usage of brand/logo: <strong>Yes</strong></li>
                    </ul>
                </div>
            </div>
        </div>
    );
});

// Helper component for label + input pairs to reduce repetition and fix styles
const FormField = ({ label, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {children}
    </div>
);


const SponsorshipManagePage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [formData, setFormData] = useState({});
    const [isEditable, setIsEditable] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const pdfContentRef = useRef(null);

    useEffect(() => {
        const fetchSponsorshipData = async () => {
            if (!token) {
                setError('No access token provided. Access denied.');
                setLoading(false); return;
            }
            try {
                const response = await axios.get(`/api/sponsorships/${id}?token=${token}`);
                setFormData(response.data.sponsorship);
                setIsEditable(response.data.isEditable);
            } catch (err) {
                setError('Could not fetch your application details. The link may be invalid or expired.');
            } finally { setLoading(false); }
        };
        fetchSponsorshipData();
    }, [id, token]);
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSuccess(''); setError('');
        try {
            await axios.put(`/api/sponsorships/${id}?token=${token}`, formData);
            setSuccess('Application updated successfully!');
            setIsEditable(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update. The editing period may have expired.');
        }
    };
        
    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this application permanently?')) {
            try {
                await axios.delete(`/api/sponsorships/${id}?token=${token}`);
                localStorage.removeItem('sponsorshipApplication');
                alert('Application deleted successfully.');
                navigate('/club'); 
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete. The deletion period may have expired.');
            }
        }
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
    };

    const handleDownloadPDF = () => {
        const input = pdfContentRef.current;
        if (!input) return;
        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4', true);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasRatio = canvas.width / canvas.height;
            const pdfRatio = pdfWidth / pdfHeight;
            let finalWidth, finalHeight;
            if (canvasRatio > pdfRatio) {
                finalWidth = pdfWidth;
                finalHeight = pdfWidth / canvasRatio;
            } else {
                finalHeight = pdfHeight;
                finalWidth = pdfHeight * canvasRatio;
            }
            const xPos = (pdfWidth - finalWidth) / 2;
            const yPos = (pdfHeight - finalHeight) / 2;
            pdf.addImage(imgData, 'PNG', xPos, yPos, finalWidth, finalHeight, undefined, 'FAST');
            pdf.save(`Sponsorship_Application_${formData.organizationName}.pdf`);
        });
    };

    if (loading) return <div className="text-center p-10">Loading your application...</div>;
    
    return (
        <div className="container mx-auto my-10 px-4">
            <div style={{ position: 'absolute', left: '-9999px', top: 'auto', zIndex:-1 }}>
                <PDFLayout ref={pdfContentRef} data={formData} />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                 <h1 className="text-3xl md:text-4xl font-bold text-center">Manage Your Sponsorship Application</h1>
                {formData && (
                    <button onClick={handleDownloadPDF} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors">
                        <FaFilePdf /> Download as PDF
                    </button>
                )}
            </div>

            {error && <div className="bg-red-100 border-red-500 text-red-700 border-l-4 p-4 mb-4">{error}</div>}
            {success && <div className="bg-green-100 border-green-500 text-green-700 border-l-4 p-4 mb-4">{success}</div>}
            
            {formData && (
                <form onSubmit={handleUpdate} className="bg-white p-8 rounded-lg shadow-xl border">
                    <fieldset disabled={!isEditable} className="space-y-6">
                        {!isEditable && !success && (
                            <p className="text-yellow-800 bg-yellow-100 p-3 rounded-md text-center border border-yellow-300">
                                The 5-hour editing period has expired. You can no longer modify or delete this application.
                            </p>
                        )}
                        
                        <fieldset className="border rounded-lg p-4">
                            <legend className="font-bold text-lg px-2">1. Sponsorship Information</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <FormField label="Full Name *"><input name="fullName" value={formData.fullName || ''} onChange={handleChange} required className="input-field" /></FormField>
                                <FormField label="Organization Name *"><input name="organizationName" value={formData.organizationName || ''} onChange={handleChange} required className="input-field" /></FormField>
                                <FormField label="Contact Person *"><input name="contactPerson" value={formData.contactPerson || ''} onChange={handleChange} required className="input-field" /></FormField>
                                <FormField label="Email Address *"><input type="email" name="email" value={formData.email || ''} onChange={handleChange} required className="input-field" /></FormField>
                                <FormField label="Phone Number *"><input type="tel" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} required className="input-field" /></FormField>
                                <div className="md:col-span-2"><FormField label="Full Address (Street, City, Country) *"><input name="address" value={formData.address || ''} onChange={handleChange} required className="input-field" /></FormField></div>
                            </div>
                        </fieldset>

                        <fieldset className="border rounded-lg p-4">
                            <legend className="font-bold text-lg px-2">2. Sponsorship Details</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                                 <FormField label="Sponsorship Plan *">
                                     <select name="sponsorshipPlan" value={formData.sponsorshipPlan || 'Silver'} onChange={handleChange} required className="input-field">
                                         <option value="Silver">Silver - 50,000 LKR</option><option value="Gold">Gold - 100,000 LKR</option><option value="Platinum">Platinum - 250,000 LKR</option>
                                    </select>
                                 </FormField>
                                 <FormField label="Amount (LKR)"><input type="text" name="sponsorshipAmount" value={formData.sponsorshipAmount ? formData.sponsorshipAmount.toLocaleString() : '0'} readOnly className="input-field bg-gray-100"/></FormField>
                                 <FormField label="Sponsorship Start Date *"><input type="date" name="startDate" value={formatDateForInput(formData.startDate)} onChange={handleChange} required className="input-field"/></FormField>
                                 <FormField label="Sponsorship End Date *"><input type="date" name="endDate" value={formatDateForInput(formData.endDate)} onChange={handleChange} required className="input-field"/></FormField>
                            </div>
                        </fieldset>
                        
                        <fieldset className="border rounded-lg p-4">
                            <legend className="font-bold text-lg px-2">3. Agreement & Conditions</legend>
                            <div className="space-y-2 mt-2">
                                 <label className="flex items-center"><input type="checkbox" name="agreedToTerms" checked={formData.agreedToTerms || false} onChange={handleChange} required className="mr-3 h-5 w-5"/> I agree to the terms and conditions.</label>
                                 <label className="flex items-center"><input type="checkbox" name="agreedToLogoUsage" checked={formData.agreedToLogoUsage || false} onChange={handleChange} required className="mr-3 h-5 w-5"/> I allow the club to use my brand/logo.</label>
                            </div>
                        </fieldset>

                        {isEditable && (
                            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 pt-4 border-t mt-6">
                                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">Update Application</button>
                                <button type="button" onClick={handleDelete} className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700">Delete Application</button>
                            </div>
                        )}
                    </fieldset>
                </form>
            )}
        </div>
    );
};

export default SponsorshipManagePage;
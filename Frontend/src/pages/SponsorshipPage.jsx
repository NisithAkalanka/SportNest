import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  FaTrophy,
  FaCheckCircle,
  FaDownload,
  FaArrowLeft,
  FaUserGraduate,
  FaUserShield,
  FaCrown
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ========================== Sponsorship & Membership Data ==========================
const sponsorshipPlans = [
  { name: 'Silver', price: 50000, features: ['Logo on our website', 'Social media shout-out', '2 event passes'] },
  { name: 'Gold', price: 100000, features: ['All Silver benefits', 'Banner at one event', 'Logo on team t-shirts'] },
  { name: 'Platinum', price: 250000, features: ['All Gold benefits', 'Main event sponsorship', 'Banner at all events'] }
];

const membershipPlanDetails = [
  { name: 'Student Membership', price: '500 LKR/year', icon: <FaUserGraduate className="text-blue-500 mx-auto text-3xl mb-2" /> },
  { name: 'Ordinary Membership', price: '1500 LKR/year', icon: <FaUserShield className="text-green-500 mx-auto text-3xl mb-2" /> },
  { name: 'Life Membership', price: '10,000 LKR/lifetime', icon: <FaCrown className="text-yellow-500 mx-auto text-3xl mb-2" /> }
];

// ========================== Component Start ==========================
const SponsorshipPage = () => {
  const navigate = useNavigate();
  const pdfContentRef = useRef(null);
  const [downloadTimestamp, setDownloadTimestamp] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    fullName: '',
    organizationName: '',
    contactPerson: '',
    email: '',
    phoneNumber: '',
    address: '',
    sponsorshipPlan: 'Silver',
    sponsorshipAmount: 50000,
    startDate: today,
    endDate: '',
    agreedToTerms: false,
    agreedToLogoUsage: false
  });

  const [errors, setErrors] = useState({});
  const [manageableApp, setManageableApp] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load last sponsorship app if exists
  useEffect(() => {
    const savedAppData = localStorage.getItem('sponsorshipApplication');
    if (savedAppData) {
      setManageableApp(JSON.parse(savedAppData));
    }
  }, []);

  // ========================== Validation ==========================
  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
      case 'organizationName':
      case 'contactPerson':
        return /^[A-Za-z\s]+$/.test(value)
          ? ''
          : 'This field must contain only letters and spaces.';
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? ''
          : 'Please enter a valid email address (e.g., user@domain.com).';
      case 'phoneNumber':
        return /^(0\d{9}|\+94\d{9})$/.test(value)
          ? ''
          : 'Invalid phone number (e.g., 0771234567 or +94771234567).';
      case 'address':
        return value.length <= 50 ? '' : 'Address cannot be longer than 50 characters.';
      case 'startDate':
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        const selectedStart = new Date(value);
        return selectedStart >= todayDate ? '' : 'Start date cannot be in the past.';
      case 'endDate':
        if (!formData.startDate) return 'Please select a start date first.';
        const startDate = new Date(formData.startDate);
        const selectedEnd = new Date(value);
        return selectedEnd > startDate ? '' : 'End date must be after the start date.';
      default:
        return '';
    }
  };

  // ========================== Handlers ==========================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };
      if (name === 'startDate') {
        const newStart = new Date(newValue);
        const endDate = new Date(updated.endDate);
        if (endDate <= newStart) updated.endDate = '';
      }
      return updated;
    });

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const msg = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: msg }));
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
      const msg = validateField(name, formData[name]);
      if (msg) validationErrors[name] = msg;
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setError('Please correct the errors highlighted below.');
      return;
    }
    if (!formData.agreedToTerms || !formData.agreedToLogoUsage) {
      setError('Please agree to the terms and logo usage.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post('/api/sponsorships', formData);
      const { sponsorshipId, accessToken, message } = res.data;
      const appData = { id: sponsorshipId, token: accessToken };
      localStorage.setItem('sponsorshipApplication', JSON.stringify(appData));
      setManageableApp(appData);
      setSuccess(message || 'Application submitted successfully!');
      setTimeout(() => {
        navigate(`/sponsorship/manage/${sponsorshipId}?token=${accessToken}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================== PDF Download ==========================
  const handleDownloadPDF = () => {
    const ts = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    setDownloadTimestamp(ts);
  };

  useEffect(() => {
    if (downloadTimestamp) {
      const input = pdfContentRef.current;
      if (!input) return;
      const now = new Date();
      const fileName = `SportNest-Sponsorship_${now.toISOString().slice(0, 19).replace(/[:T]/g, '-')}.pdf`;
      html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const width = pdf.internal.pageSize.getWidth();
        const height = (canvas.height * width) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, width, height);
        pdf.save(fileName);
        setDownloadTimestamp('');
      });
    }
  }, [downloadTimestamp]);

  // ========================== JSX ==========================
  return (
    <div className="bg-gray-100">
      <div className="container mx-auto py-16 px-4">

        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold">
            <FaArrowLeft /> Back
          </button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Partner with Us</h1>
          <p className="text-lg text-gray-600 mt-2">Join us in championing community sports and excellence.</p>
        </div>

        {/* PDF Section */}
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md mb-16">
          <div ref={pdfContentRef} className="p-8 sm:p-10">
            <div className="text-center pb-4 border-b">
              <h1 className="text-3xl font-bold text-gray-800">SportNest Club</h1>
              <p className="text-gray-500">Sponsorship Details</p>
            </div>

            {downloadTimestamp && (
              <div className="text-center text-xs text-gray-500 pt-2 pb-2 border-b">
                <strong>Document Generated On:</strong> {downloadTimestamp}
              </div>
            )}

            <div className="mt-6 space-y-4 text-sm text-gray-700 leading-relaxed">
              <h2 className="text-xl font-bold text-gray-800">Sponsorship Opportunities</h2>
              <p>
                Partnering with SportNest is a rewarding way to promote your brand while investing in youth development,
                healthy lifestyles, and community impact through our events.

                We're looking here to see who filled out the Samiapp application first. We're tracking the person who applied first and contacting them. 
                You have access to this form for five hours after you file it. You can edit and delete it if you want.
              </p>

              <h2 className="text-xl font-bold text-gray-800">Requirements for Sponsors</h2>
              <ul className="space-y-1">
                {[
                  'Valid company/business registration',
                  'Official contact person details',
                  'High-quality brand assets',
                  'Signed agreement or MOU'
                ].map((item) => (
                  <li key={item} className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-2" /> {item}
                  </li>
                ))}
              </ul>

              <h2 className="text-xl font-bold text-gray-800">Benefits of Sponsorship</h2>
              <ul className="space-y-1">
                {[
                  'Brand Exposure on jerseys & banners',
                  'Mentions on our website & social media',
                  'Community Engagement opportunities',
                  'Positive CSR impact',
                  'Exclusive VIP perks'
                ].map((item) => (
                  <li key={item} className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-2" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="px-8 sm:px-10 pb-8 border-t pt-6 text-center">
            <button
              onClick={handleDownloadPDF}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaDownload /> Download Sponsorship Details (PDF)
            </button>
          </div>
        </div>

        {/* Sponsorship Tiers */}
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Our Sponsorship Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {sponsorshipPlans.map(plan => (
            <div key={plan.name} className="border-2 p-6 rounded-lg text-center flex flex-col hover:border-indigo-500 hover:shadow-xl transition-all duration-300">
              <h3 className={`text-2xl font-bold mb-4 ${plan.name === 'Gold'
                ? 'text-yellow-500'
                : plan.name === 'Platinum'
                ? 'text-gray-700'
                : 'text-gray-400'}`}>{plan.name}</h3>
              <p className="text-4xl font-bold mb-4">{plan.price.toLocaleString()} LKR</p>
              <ul className="text-left space-y-2 flex-grow mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center"><FaTrophy className="text-green-500 mr-2" />{f}</li>
                ))}
              </ul>
              <button
                onClick={() => handlePlanSelect(plan)}
                className="mt-auto bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700"
              >
                Select {plan.name}
              </button>
            </div>
          ))}
        </div>

        {/* Manage existing app */}
        {manageableApp && !success && (
          <div className="text-center mb-8 bg-blue-100 p-4 rounded-lg border border-blue-300">
            <p className="text-blue-800 mb-2">You have a recent application. Want to manage it?</p>
            <button
              onClick={() => navigate(`/sponsorship/manage/${manageableApp.id}?token=${manageableApp.token}`)}
              className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700"
            >
              Manage My Recent Application
            </button>
          </div>
        )}

        {/* Sponsorship Form */}
        <form onSubmit={handleSubmit} id="sponsorship-form" className="bg-white p-8 rounded-lg shadow-xl border">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Sponsorship Application Form</h2>
          {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">{error}</div>}
          {success && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6">{success}</div>}

          {!success && (
            <>
              <fieldset className="border rounded-lg p-4 mb-6">
                <legend className="font-bold text-lg px-2">1. Sponsor Information</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-2">
                  <div>
                    <input name="fullName" value={formData.fullName} onChange={handleChange} onBlur={handleBlur} placeholder="Full Name *" required className="input-field" />
                    <p className="text-red-500 text-xs mt-1 h-4">{errors.fullName}</p>
                  </div>
                  <div>
                    <input name="organizationName" value={formData.organizationName} onChange={handleChange} onBlur={handleBlur} placeholder="Organization Name *" required className="input-field" />
                    <p className="text-red-500 text-xs mt-1 h-4">{errors.organizationName}</p>
                  </div>
                  <div>
                    <input name="contactPerson" value={formData.contactPerson} onChange={handleChange} onBlur={handleBlur} placeholder="Contact Person *" required className="input-field" />
                    <p className="text-red-500 text-xs mt-1 h-4">{errors.contactPerson}</p>
                  </div>
                  <div>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} placeholder="Email Address *" required className="input-field" />
                    <p className="text-red-500 text-xs mt-1 h-4">{errors.email}</p>
                  </div>
                  <div>
                    <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} onBlur={handleBlur} placeholder="Phone Number *" required className="input-field" />
                    <p className="text-red-500 text-xs mt-1 h-4">{errors.phoneNumber}</p>
                  </div>
                  <div className="md:col-span-2">
                    <input name="address" value={formData.address} onChange={handleChange} onBlur={handleBlur} placeholder="Full Address *" required className="input-field" />
                    <p className="text-red-500 text-xs mt-1 h-4">{errors.address}</p>
                  </div>
                </div>
              </fieldset>

              <fieldset className="border rounded-lg p-4 mb-6">
                <legend className="font-bold text-lg px-2">2. Sponsorship Details</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-2">
                  <div>
                    <label className="form-label">Sponsorship Plan *</label>
                    <select name="sponsorshipPlan" value={formData.sponsorshipPlan} onChange={handleChange} required className="input-field">
                      {sponsorshipPlans.map(plan => (
                        <option key={plan.name} value={plan.name}>{plan.name} - {plan.price.toLocaleString()} LKR</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Amount (LKR)</label>
                    <input type="text" value={formData.sponsorshipAmount.toLocaleString()} readOnly className="input-field bg-gray-100" />
                  </div>

                  <div>
                    <label className="form-label">Sponsorship Start Date *</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} onBlur={handleBlur} required className="input-field" min={today} />
                    <p className="text-red-500 text-xs mt-1 h-4">{errors.startDate}</p>
                  </div>

                  <div>
                    <label className="form-label">Sponsorship End Date *</label>
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} onBlur={handleBlur} required className="input-field" min={formData.startDate || today} disabled={!formData.startDate} />
                    <p className="text-red-500 text-xs mt-1 h-4">{errors.endDate}</p>
                  </div>
                </div>
              </fieldset>

              <fieldset className="mb-6">
                <legend className="font-bold text-lg mb-2">4. Agreement & Conditions</legend>
                <div className="space-y-2 mt-2">
                  <label className="flex items-center">
                    <input type="checkbox" name="agreedToTerms" checked={formData.agreedToTerms} onChange={handleChange} required className="mr-3 h-5 w-5" />
                    I agree to the terms and conditions.
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" name="agreedToLogoUsage" checked={formData.agreedToLogoUsage} onChange={handleChange} required className="mr-3 h-5 w-5" />
                    I allow the club to use my brand/logo.
                  </label>
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default SponsorshipPage;

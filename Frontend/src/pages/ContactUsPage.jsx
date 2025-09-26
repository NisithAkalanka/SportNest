// File: frontend/src/pages/ContactUsPage.jsx (FIXED & IMPROVED VALIDATION)

import React, { useState } from 'react';
// import contactService from '../api/contactService'; // Assuming the path is correct
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validate = () => {
    let tempErrors = {};
    
    if (!formData.name.trim()) {
        tempErrors.name = "Full Name is required.";
    } else if (formData.name.trim().length < 3) {
        tempErrors.name = "Name must be at least 3 characters long.";
    }

    if (!formData.email.trim()) {
      tempErrors.email = "Email is required.";
    } else if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(formData.email)) {
      tempErrors.email = "Please use a valid email with lowercase letters only.";
    }

    const wordCount = formData.message.trim().split(/\s+/).filter(Boolean).length;
    if (!formData.message.trim()) {
      tempErrors.message = "Message is required.";
    } else if (wordCount > 50) {
      // This error message will be shown if the user submits despite the real-time warning
      tempErrors.message = `Word limit of 50 has been exceeded.`;
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setStatus({ message: '', type: '' });
    try {
      // Your API call would be here, for example:
      // await contactService.submitContactForm({ ...formData, subject: 'Website Inquiry' });
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStatus({ message: 'Thank you! Your message has been sent.', type: 'success' });
      setFormData({ name: '', email: '', message: '' });
      setErrors({});
    } catch (error) {
      setStatus({ message: 'An error occurred while sending the message.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="relative min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80')" }}
    >
      <div className="absolute inset-0 bg-slate-900 bg-opacity-75"></div>
      <div className="relative z-10 container mx-auto px-6 py-16 lg:py-24">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Contact Us</h1>
          <p className="mt-4 text-lg text-slate-300">
            Have questions or feedback? We'd love to hear from you. Reach out to us through any of the methods below.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start max-w-6xl mx-auto">
          <div className="space-y-10 mt-2">
            <ContactInfoItem icon={<FaMapMarkerAlt size={22} />} title="Address" details="123 SportNest Lane, Colombo 07, Sri Lanka" />
            <ContactInfoItem icon={<FaPhoneAlt size={22} />} title="Phone" details="+94 11 2345 678" />
            <ContactInfoItem icon={<FaEnvelope size={22} />} title="Email" details="contact@sportnest.com" />
          </div>
          <div className="bg-white text-slate-800 p-8 rounded-lg shadow-2xl">
            <h2 className="text-3xl font-bold mb-6">Send Message</h2>
            {status.message && (
                <p className={`p-3 mb-4 rounded-md text-center text-sm ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {status.message}
                </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormInput name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" error={errors.name} />
              <FormInput name="email" value={formData.email} onChange={handleChange} placeholder="Email (e.g., yourname@example.com)" error={errors.email} type="email"/>
              <FormInput 
                  name="message" 
                  value={formData.message} 
                  onChange={handleChange} 
                  placeholder="Type your Message..." 
                  error={errors.message} 
                  isTextarea={true}
                  wordLimit={50}
              />
              <button type="submit" disabled={loading} className="w-full bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-600 transition duration-300 disabled:bg-cyan-300">
                {loading ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactInfoItem = ({ icon, title, details }) => (
  <div className="flex items-center gap-5">
    <div className="bg-white text-slate-800 p-4 rounded-full">
      {icon}
    </div>
    <div>
      <h3 className="text-xl font-bold text-cyan-400">{title}</h3>
      <p className="text-slate-200 mt-1">{details}</p>
    </div>
  </div>
);

// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★ Real-time validation සහිතව සම්පූර්ණයෙන්ම යාවත්කාලීන කළ FormInput Component එක ★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
const FormInput = ({ name, value, onChange, placeholder, error, type = 'text', isTextarea = false, wordLimit = 0 }) => {
  const wordCount = isTextarea ? value.trim().split(/\s+/).filter(Boolean).length : 0;
  const isLimitExceeded = isTextarea && wordLimit > 0 && wordCount > wordLimit;

  return (
    <div className="relative pb-5"> {/* Made space for the absolute positioned error/counter message */}
      {isTextarea ? (
        <textarea 
          name={name} 
          value={value} 
          onChange={onChange} 
          placeholder={placeholder} 
          rows="4" 
          // --- Error එක ඇති විට border එක රතු පැහැයට හැරවීම ---
          className={`w-full bg-transparent border-b-2 p-2 transition focus:outline-none ${error || isLimitExceeded ? 'border-red-500' : 'border-slate-300 focus:border-cyan-500'}`} 
        />
      ) : (
        <input 
          type={type} 
          name={name} 
          value={value} 
          onChange={onChange} 
          placeholder={placeholder} 
          // --- Error එක ඇති විට border එක රතු පැහැයට හැරවීම ---
          className={`w-full bg-transparent border-b-2 p-2 transition focus:outline-none ${error ? 'border-red-500' : 'border-slate-300 focus:border-cyan-500'}`} 
        />
      )}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center pt-1">
        {/* --- Error Message සහ Word Counter Logic එක මෙතනින් හැසිරවීම --- */}
        {error ? (
          <p className="text-red-500 text-xs">{error}</p> // 'Submit' කළ විට එන error (e.g., "Message is required")
        ) : isLimitExceeded ? (
          <p className="text-red-500 text-xs">Word limit of {wordLimit} exceeded ({wordCount} words)</p> // Type කරන විට word limit එක ඉක්මවූ විට
        ) : (
          isTextarea && <p className="text-xs text-slate-400 ml-auto">{wordLimit - wordCount} words remaining</p> // අනිත් සෑම අවස්ථාවකම
        )}
      </div>
    </div>
  );
};

export default ContactUsPage;
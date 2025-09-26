// File: frontend/src/pages/ContactUsPage.jsx (FINAL VERSION WITH NEW BACKGROUND IMAGE & CONTENT)

import React, { useState, useMemo } from 'react';
import contactService from '../api/contactService'; // Assuming the path is correct
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa'; // Icons for contact info

const ContactUsPage = () => {
  // --- Form Logic ---
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const wordCount = useMemo(() => {
    return formData.message.trim() === '' ? 0 : formData.message.trim().split(/\s+/).length;
  }, [formData.message]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'email') {
        value = value.toLowerCase();
    }
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.name.trim()) {
        tempErrors.name = "Full Name is required.";
    }
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!formData.email.trim()) {
      tempErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = "Please enter a valid email with lowercase letters only.";
    }
    if (!formData.message.trim()) {
      tempErrors.message = "Message is required.";
    } else if (wordCount > 50) {
      tempErrors.message = "Message must not exceed 50 words.";
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
      console.log("Submitting:", formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus({ message: 'Thank you! Your message has been sent.', type: 'success' });
      setFormData({ name: '', email: '', message: '' });
      setErrors({});
    } catch (error) {
      setStatus({ message: error.response?.data?.message || 'An error occurred. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="relative min-h-screen bg-cover bg-center text-white"
      // ★★★ 1. Background Image එක සඳහා නව, විශ්වාසදායක link එකක් ★★★
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop')" }}
    >
      <div className="absolute inset-0 bg-slate-900 bg-opacity-70"></div>
      <div className="relative z-10 container mx-auto px-6 py-16 lg:py-24">

        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Contact Us</h1>
          <p className="mt-4 text-lg text-slate-300">
            We're here to help! Whether you have a question about our clubs, training sessions, membership, or anything else, our team is ready to answer all your questions. Fill out the form below or use our contact details to get in touch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start max-w-6xl mx-auto">
          
          <div className="space-y-10 mt-2">
            <ContactInfoItem icon={<FaMapMarkerAlt size={22} />} title="Address" details="No.07, Padukka, Colombo, Sri Lanka" />
            <ContactInfoItem icon={<FaPhoneAlt size={22} />} title="Phone" details="070 303 6840" />
            <ContactInfoItem icon={<FaEnvelope size={22} />} title="Email" details="contact@sportnest.com" />
          </div>
          
          <div className="bg-white text-slate-800 p-8 rounded-lg shadow-2xl">
            <h2 className="text-3xl font-bold mb-6">Send Message</h2>
            
            {status.message && (
                <p className={`p-3 mb-4 rounded-md text-center text-sm ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {status.message}
                </p>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <FormInput name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" error={errors.name} />
              <FormInput name="email" value={formData.email} onChange={handleChange} placeholder="Email" error={errors.email} type="email"/>
              <FormInput 
                name="message" 
                value={formData.message} 
                onChange={handleChange} 
                placeholder="Type your Message..." 
                error={errors.message} 
                isTextarea={true}
                wordCount={wordCount}
                maxWords={50}
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

const FormInput = ({ name, value, onChange, placeholder, error, type = 'text', isTextarea = false, wordCount, maxWords }) => (
  <div className="relative pb-5">
    {isTextarea ? (
      <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows="4" className={`w-full bg-transparent border-b-2 p-2 transition focus:outline-none ${error ? 'border-red-500' : 'border-slate-300 focus:border-cyan-500'}`} />
    ) : (
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className={`w-full bg-transparent border-b-2 p-2 transition focus:outline-none ${error ? 'border-red-500' : 'border-slate-300 focus:border-cyan-500'}`} />
    )}
    <div className="absolute w-full flex justify-between items-center mt-1">
        {error ? <p className="text-red-500 text-xs">{error}</p> : <div />}
        {isTextarea && (
             <p className={`text-xs font-medium ${wordCount > maxWords ? 'text-red-500' : 'text-slate-400'}`}>
                 {wordCount}/{maxWords}
             </p>
        )}
    </div>
  </div>
);


export default ContactUsPage;
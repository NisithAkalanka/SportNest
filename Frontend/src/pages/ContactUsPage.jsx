// File: frontend/src/pages/ContactUsPage.jsx (NEW DESIGN WITH VALIDATION)

import React, { useState } from 'react';
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // --- Validation Logic ---
  const validate = () => {
    let tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Full Name is required.";
    if (!formData.email.trim()) {
      tempErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Email is not valid.";
    }
    if (!formData.message.trim()) {
      tempErrors.message = "Message is required.";
    } else if (formData.message.trim().length < 10) {
      tempErrors.message = "Message must be at least 10 characters long.";
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
      await contactService.submitContactForm({ ...formData, subject: 'Website Inquiry' }); // Subject added
      setStatus({ message: 'Thank you! Your message has been sent.', type: 'success' });
      setFormData({ name: '', email: '', message: '' });
      setErrors({});
    } catch (error) {
      setStatus({ message: error.response?.data?.message || 'An error occurred.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- UI (JSX) for the new design ---
  return (
    <div 
      className="relative min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: "url('https://images.pexels.com/photos/93398/pexels-photo-93398.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }} // A nice city background image
    >
      <div className="absolute inset-0 bg-slate-900 bg-opacity-75"></div>
      <div className="relative z-10 container mx-auto px-6 py-16 lg:py-24">

        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Contact Us</h1>
          <p className="mt-4 text-lg text-slate-300">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
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
              <FormInput name="email" value={formData.email} onChange={handleChange} placeholder="Email" error={errors.email} type="email"/>
              <FormInput name="message" value={formData.message} onChange={handleChange} placeholder="Type your Message..." error={errors.message} isTextarea={true}/>

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

// Reusable component for contact info items (Address, Phone, Email)
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

// Reusable component for form inputs to keep the code clean
const FormInput = ({ name, value, onChange, placeholder, error, type = 'text', isTextarea = false }) => (
  <div className="relative">
    {isTextarea ? (
      <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows="4" className={`w-full bg-transparent border-b-2 p-2 transition focus:outline-none ${error ? 'border-red-500' : 'border-slate-300 focus:border-cyan-500'}`} />
    ) : (
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className={`w-full bg-transparent border-b-2 p-2 transition focus:outline-none ${error ? 'border-red-500' : 'border-slate-300 focus:border-cyan-500'}`} />
    )}
    {error && <p className="text-red-500 text-xs mt-1 absolute">{error}</p>}
  </div>
);


export default ContactUsPage;
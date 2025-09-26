// File: frontend/src/pages/ContactUsPage.jsx (EMERALD / GLASS UI)

import React, { useState, useMemo } from 'react';
import contactService from '../api/contactService';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

const ContactUsPage = () => {
  // --- Form Logic ---
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const wordCount = useMemo(() => (formData.message.trim() === '' ? 0 : formData.message.trim().split(/\s+/).length), [formData.message]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'email') value = value.toLowerCase();
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const validate = () => {
    const temp = {};
    if (!formData.name.trim()) temp.name = 'Full Name is required.';
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!formData.email.trim()) temp.email = 'Email is required.';
    else if (!emailRegex.test(formData.email)) temp.email = 'Please enter a valid email with lowercase letters only.';
    if (!formData.message.trim()) temp.message = 'Message is required.';
    else if (wordCount > 50) temp.message = 'Message must not exceed 50 words.';
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setStatus({ message: '', type: '' });
    try {
      // If you later wire the backend: await contactService.submitContactForm(formData);
      await new Promise((r) => setTimeout(r, 1000));
      setStatus({ message: 'Thank you! Your message has been sent.', type: 'success' });
      setFormData({ name: '', email: '', message: '' });
      setErrors({});
    } catch (error) {
      setStatus({ message: error.response?.data?.message || 'An error occurred. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Use the same ground image used elsewhere for visual consistency
  const backgroundImageUrl = '/assets/ground.jpeg';

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-fixed bg-no-repeat text-white"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      {/* dark tint */}
      <div className="absolute inset-0 bg-slate-950/60"></div>

      <div className="relative z-10 container mx-auto px-6 py-16 lg:py-24">
        {/* Header */}
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Get in <span className="text-emerald-300">Touch</span>
          </h1>
          <p className="mt-4 text-lg text-white/80">
            We're here to help! Ask about the club, training sessions, memberships—or anything else.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start max-w-6xl mx-auto">
          {/* Contact info (glass cards) */}
          <div className="space-y-6">
            <InfoCard icon={<FaMapMarkerAlt size={22} />} title="Address" details="No.07, Padukka, Colombo, Sri Lanka" />
            <InfoCard icon={<FaPhoneAlt size={22} />} title="Phone" details="070 303 6840" />
            <InfoCard icon={<FaEnvelope size={22} />} title="Email" details="contact@sportnest.com" />
          </div>

          {/* Form (glass) */}
          <div className="bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border border-white/30 dark:border-zinc-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-900">Send Message</h2>

            {status.message && (
              <p
                className={`p-3 mb-5 rounded-md text-center text-sm ${
                  status.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {status.message}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <InputField name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" error={errors.name} />
              <InputField name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" error={errors.email} />
              <InputField
                name="message"
                isTextarea
                value={formData.message}
                onChange={handleChange}
                placeholder="Type your message..."
                error={errors.message}
                wordCount={wordCount}
                maxWords={50}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold py-3 px-6 rounded-xl shadow-sm transition"
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ icon, title, details }) => (
  <div className="bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md rounded-2xl p-6 border border-white/30 dark:border-zinc-800 shadow-lg flex items-start gap-4">
    <div className="shrink-0 w-11 h-11 rounded-full grid place-content-center bg-emerald-600 text-white">{icon}</div>
    <div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-slate-600 mt-1">{details}</p>
    </div>
  </div>
);

const InputField = ({ name, value, onChange, placeholder, error, type = 'text', isTextarea = false, wordCount, maxWords }) => (
  <div className="relative">
    {isTextarea ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={5}
        className={`w-full rounded-xl border bg-white/95 text-slate-900 placeholder:text-gray-400 border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
          error ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : ''
        }`}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-white/95 text-slate-900 placeholder:text-gray-400 border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
          error ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : ''
        }`}
      />
    )}
    <div className="mt-1 flex justify-between items-center">
      {error ? <p className="text-red-600 text-xs">{error}</p> : <span />}
      {isTextarea && (
        <p className={`text-xs font-medium ${wordCount > maxWords ? 'text-red-600' : 'text-slate-500'}`}>{wordCount}/{maxWords}</p>
      )}
    </div>
  </div>
);

export default ContactUsPage;

import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/MemberAuthContext';
import api from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

//  Inline SVG Icons (no extra deps) 
const EyeOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
  </svg>
);

const EyeClosedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074L3.707 2.293zM8.707 6.553l1.514 1.515a2 2 0 01-2.828 2.828L5.88 9.382A4 4 0 0010 14a4 4 0 10-1.293-7.447z" clipRule="evenodd" />
    <path d="M10 12a2 2 0 110-4 2 2 0 010 4z" />
  </svg>
);

// NIC eken wayasa gananaya karana function eka
const calculateAgeFromNIC = (nic) => {
  if (!nic || nic.length !== 12) return null;
  let year = parseInt(nic.substring(0, 4), 10);
  let dayOfYear = parseInt(nic.substring(4, 7), 10);
  if (dayOfYear > 500) { dayOfYear -= 500; }
  const birthDate = new Date(year, 0);
  birthDate.setDate(dayOfYear);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; }
  return age >= 18 ? age : null;
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { user, login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', age: '', nic: '',
    gender: 'Male', role: 'Member', email: '',
    contactNumber: '', password: '', confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Logged-in redirect
  useEffect(() => {
    if (user) {
      navigate(user.role === 'Coach' ? '/coach/dashboard' : '/member-dashboard');
    }
  }, [user, navigate]);

  // Auto-calc age when NIC changes
  useEffect(() => {
    const calculatedAge = calculateAgeFromNIC(formData.nic);
    setFormData(prev => ({ ...prev, age: calculatedAge ? calculatedAge.toString() : '' }));
  }, [formData.nic]);

  // Validation
  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!/^[A-Za-z]+$/.test(value)) return 'Only letters are allowed.';
        if (value.length < 3) return 'Name must be at least 3 characters.';
        return '';
      case 'nic':
       if (!/^\d{12}$/.test(value)) return 'NIC must be exactly 12 digits.';
       if (!calculateAgeFromNIC(value)) return 'Invalid NIC or you must be over 18 years old.';
       return '';
      case 'contactNumber':
        if (!/^(?:\+94\d{9}|0\d{9})$/.test(value)) return 'Use format: 0xxxxxxxxx or +94xxxxxxxxx.';
        return '';
      case 'email':
        if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(value)) return 'Please use only lowercase letters (e.g., yourname@example.com).';
        return '';
      case 'password':
        if (value.length < 8) return 'Password must be at least 8 characters long.';
        if (!/[A-Z]/.test(value)) return 'Must contain an uppercase letter.';
        if (!/[a-z]/.test(value)) return 'Must contain a lowercase letter.';
        if (!/\d/.test(value)) return 'Must contain a number.';
        if (!/[@$!%*?&]/.test(value)) return 'Must contain a special character (@$!%*?&).';
        return '';
      case 'confirmPassword':
        return value === formData.password ? '' : 'Passwords do not match.';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (value !== undefined) {
      const errorMessage = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: errorMessage }));
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // validate all
    let formIsValid = true;
    const validationErrors = Object.keys(formData).reduce((acc, name) => {
      const errorMessage = validateField(name, formData[name]);
      if (errorMessage) { formIsValid = false; acc[name] = errorMessage; }
      return acc;
    }, {});
    if (!formIsValid) { setErrors(validationErrors); return; }

    setIsSubmitting(true);
    try {
      const { data } = await api.post('/members/register', formData);
      login(data);
      alert('Registration Successful! Redirecting to your dashboard...');
      navigate(data.role === 'Coach' ? '/coach/dashboard' : '/member-dashboard');
    } catch (err) {
      setErrors({ form: err?.response?.data?.message || 'Registration failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background with soft overlay image (reuse login background) */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.78), rgba(255,255,255,0.78)), url('/images/login-bg.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'saturate(1.05)'
          }}
        />
        <div className="absolute -top-20 -right-16 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
          {/* Showcase panel */}
          <div className="hidden lg:flex col-span-2 rounded-3xl bg-[#0D1B2A] text-white p-10 flex-col justify-between shadow-xl ring-1 ring-white/10">
            <div>
              <div className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-white/80">Create your</span>
              </div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-emerald-300 to-orange-300 bg-clip-text text-transparent">SportNest Account</span>
              </h1>
              <p className="mt-3 text-white/80">
                Join our community of athletes and enthusiasts. Unlock events, training, shop, and more.
              </p>
            </div>

            <ul className="mt-10 space-y-4 text-white/90">
              {[
                'NIC based age auto-filled for easy verification',
                'Choose your role: Member, Player, or Coach',
                'Manage your memberships and event registrations',
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 grid h-5 w-5 place-content-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/40">
                    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor"><path d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L8.5 11.086l6.543-6.543a1 1 0 011.664.75z" /></svg>
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 text-sm text-white/70">
              Have an account already? <Link to="/login" className="underline decoration-dotted">Sign in</Link>
            </div>
          </div>

          {/* Form panel */}
          <div className="col-span-3">
            <div className="relative mx-auto w-full max-w-3xl">
              <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-orange-300/40 via-emerald-300/40 to-transparent blur-xl opacity-40" />
              <div className="rounded-3xl bg-white/90 backdrop-blur shadow-2xl ring-1 ring-black/5 p-6 sm:p-8 md:p-10">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create your account</h2>
                  <p className="mt-2 text-gray-600">Fill in your details to get started</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
                  {/* Form-level error */}
                  {'form' in errors && errors.form && (
                    <div role="alert" aria-live="assertive" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700">
                      <svg className="h-5 w-5 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 .667a9.333 9.333 0 100 18.666A9.333 9.333 0 0010 .667zM9 5h2v7H9V5zm0 8h2v2H9v-2z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">{errors.form}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* First Name */}
                    <div>
                      <Label htmlFor="firstName" className="text-sm text-gray-700">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        placeholder="e.g. John"
                      />
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                    </div>

                    {/* Last Name */}
                    <div>
                      <Label htmlFor="lastName" className="text-sm text-gray-700">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        placeholder="e.g. Doe"
                      />
                      {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                    </div>

                    {/* NIC */}
                    <div>
                      <Label htmlFor="nic" className="text-sm text-gray-700">NIC Number</Label>
                      <Input
                        id="nic"
                        name="nic"
                        value={formData.nic}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        placeholder="12 digits only"
                        maxLength={12}
                      />
                      {errors.nic && <p className="text-red-500 text-xs mt-1">{errors.nic}</p>}
                    </div>

                    {/* Age (readonly) */}
                    <div>
                      <Label htmlFor="age" className="text-sm text-gray-700">Age</Label>
                      <Input
                        id="age"
                        name="age"
                        type="text"
                        value={formData.age}
                        readOnly
                        required
                        className="bg-gray-100 cursor-not-allowed"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <Label htmlFor="gender" className="text-sm text-gray-700">Gender</Label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                    </div>

                    {/* Role */}
                    <div>
                      <Label htmlFor="role" className="text-sm text-gray-700">Role</Label>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option>Member</option>
                        <option>Player</option>
                        <option>Coach</option>
                      </select>
                    </div>

                    {/* Contact Number (full width) */}
                    <div className="md:col-span-2">
                      <Label htmlFor="contactNumber" className="text-sm text-gray-700">Contact Number</Label>
                      <Input
                        id="contactNumber"
                        type="tel"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        placeholder="0xxxxxxxxx or +94xxxxxxxxx"
                      />
                      {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
                    </div>

                    {/* Email (full width) */}
                    <div className="md:col-span-2">
                      <Label htmlFor="email" className="text-sm text-gray-700">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={(e) => handleChange({ target: { name: 'email', value: e.target.value.toLowerCase() } })}
                        onBlur={handleBlur}
                        required
                        placeholder="you@example.com"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div className="relative">
                      <Label htmlFor="password" className="text-sm text-gray-700">Password</Label>
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        placeholder="••••••••"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                      </button>
                      {errors.password && <p className="text-red-500 text-xs mt-1 max-w-full">{errors.password}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                      <Label htmlFor="confirmPassword" className="text-sm text-gray-700">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        placeholder="••••••••"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                      </button>
                      {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="space-y-3">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="relative flex justify-center w-full text-white font-medium bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isSubmitting ? (
                        <span className="inline-flex items-center gap-2">
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                          Creating account…
                        </span>
                      ) : (
                        'Create My Account'
                      )}
                    </Button>

                    <p className="text-center text-sm text-gray-600">
                      Already have an account?{' '}
                      <Link to="/login" className="font-medium text-emerald-700 hover:text-emerald-600">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
          {/* /Form panel */}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
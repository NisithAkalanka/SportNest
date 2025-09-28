// src/pages/AdminLoginPage.jsx — UPGRADED UI (matches site styling, improved UX)

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AdminAuthContext } from '@/context/AdminAuthContext';

// Shadcn/UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// --- Inline SVG Icons (no extra deps) ---
const MailIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 2v.01L12 13 4 6.01V6h16zM4 18V8.236l7.386 5.904a1 1 0 001.228 0L20 8.236V18H4z" />
  </svg>
);
const LockIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17 8V7a5 5 0 10-10 0v1H5a1 1 0 00-1 1v10a1 1 0 001 1h14a1 1 0 001-1V9a1 1 0 00-1-1h-2zm-8-1a3 3 0 016 0v1H9V7zm3 5a2 2 0 11.001 3.999A2 2 0 0112 12z" />
  </svg>
);
const EyeOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
  </svg>
);
const EyeClosedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zM7.968 6.553l1.514 1.515a2 2 0 01-2.828 2.828L5.14 9.382A4 4 0 0010 14a4 4 0 10-2.032-7.447z" clipRule="evenodd" />
    <path d="M10 12a2 2 0 110-4 2 2 0 010 4z" />
  </svg>
);

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);

  const navigate = useNavigate();
  const { admin, loginAdmin } = useContext(AdminAuthContext);

  useEffect(() => {
    if (admin) navigate('/admin-dashboard');
  }, [admin, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/admin/login', { email, password });
      loginAdmin(data);
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background with soft overlay image (keeps text readable) */}
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

      <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
          {/* Showcase panel (desktop only) */}
          <div className="hidden lg:flex col-span-2 rounded-3xl bg-[#0D1B2A] text-white p-10 flex-col justify-between shadow-xl ring-1 ring-white/10">
            <div>
              <div className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-white/80">Welcome to</span>
              </div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-emerald-300 to-orange-300 bg-clip-text text-transparent">SportNest Admin</span>
              </h1>
              <p className="mt-3 text-white/80">
                Manage inventory, suppliers, events, members and more with our powerful dashboard.
              </p>
            </div>

            <ul className="mt-10 space-y-4 text-white/90">
              {[
                'Secure admin-only access',
                'Manage shop inventory & orders',
                'Moderate reviews and events',
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
              Tip: Use a strong password. Contact a super admin if you need help.
            </div>
          </div>

          {/* Form panel */}
          <div className="col-span-3">
            <div className="relative mx-auto w-full max-w-lg">
              {/* subtle glow behind card */}
              <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-orange-300/40 via-emerald-300/40 to-transparent blur-xl opacity-40" />
              <div className="rounded-3xl bg-white/90 backdrop-blur shadow-2xl ring-1 ring-black/5 p-6 sm:p-8 md:p-10">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Portal</h2>
                  <p className="mt-2 text-gray-600">Please sign in with your admin credentials</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin} noValidate>
                  {/* Error alert */}
                  {error && (
                    <div
                      role="alert"
                      aria-live="assertive"
                      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700"
                    >
                      <svg className="h-5 w-5 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 .667a9.333 9.333 0 100 18.666A9.333 9.333 0 0010 .667zM9 5h2v7H9V5zm0 8h2v2H9v-2z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <Label htmlFor="admin-email" className="text-sm font-medium text-gray-700">Email Address</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><MailIcon /></span>
                      <Input
                        id="admin-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="admin@example.com"
                        className="pl-9"
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <Label htmlFor="admin-password" className="text-sm font-medium text-gray-700">Password</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><LockIcon /></span>
                      <Input
                        id="admin-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="pl-9 pr-10"
                        autoComplete="current-password"
                        onKeyUp={(e) => setCapsOn(e.getModifierState && e.getModifierState('CapsLock'))}
                        onKeyDown={(e) => setCapsOn(e.getModifierState && e.getModifierState('CapsLock'))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                      </button>
                    </div>
                    {capsOn && <div className="mt-1 text-xs text-orange-600">Caps Lock is on</div>}
                  </div>

                  {/* Submit */}
                  <div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="relative flex justify-center w-full text-white font-medium bg-emerald-600 hover:bg-emerald-700"
                    >
                      {loading ? (
                        <span className="inline-flex items-center gap-2">
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                          Signing In…
                        </span>
                      ) : (
                        'Sign In as Admin'
                      )}
                    </Button>
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

export default AdminLoginPage;
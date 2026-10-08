import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AgriCropLogo } from '../AgriCropLogo';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Leaf
} from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

export const AuthPage: React.FC = () => {
  const { login, register, forgotPassword, resetPassword } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetFormAlerts = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSwitchMode = (newMode: AuthMode) => {
    resetFormAlerts();
    setMode(newMode);
  };

  // Quick autofill for instant demo evaluation
  const handleQuickDemo = () => {
    setEmail('rajesh@agripulse.ai');
    setPassword('AgriPulse2025!');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormAlerts();

    // Validation
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please provide a valid email address format (e.g., name@domain.com).');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must contain at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify both fields.');
        return;
      }
    }

    if (mode === 'login') {
      if (!password) {
        setErrorMessage('Please enter your password.');
        return;
      }
    }

    if (mode === 'reset') {
      if (!resetCode.trim()) {
        setErrorMessage('Please enter the 6-digit verification code.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('New password must contain at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('New passwords do not match.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else if (mode === 'signup') {
        await register(name.trim(), email.trim(), password, confirmPassword);
      } else if (mode === 'forgot') {
        const res = await forgotPassword(email.trim());
        setSuccessMessage(res.message);
        if (res.demoResetCode) {
          setResetCode(res.demoResetCode);
        }
        setMode('reset');
      } else if (mode === 'reset') {
        await resetPassword(email.trim(), resetCode.trim(), password, confirmPassword);
        setSuccessMessage('Password updated successfully! You can now log in.');
        setMode('login');
        setPassword('');
        setConfirmPassword('');
        setResetCode('');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F4] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background agricultural contours & subtle ambient pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#1B4D31]/10 blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Header with New Agriculture / Crop Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <AgriCropLogo size="lg" variant="badge" className="mb-3 shadow-lg" />
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
            AgriPulse AI
          </h1>
          <p className="text-xs font-semibold text-emerald-800 tracking-wide uppercase mt-0.5">
            Agricultural Market Intelligence
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
            <span>Tur Dal 14-Day Volatility Engine</span>
            <span>·</span>
            <span>Mumbai APMC</span>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/60 rounded-2xl border border-[#E3ECE5] relative">
          {/* Card Title & Prompt */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'signup' && 'Create Your Account'}
              {mode === 'forgot' && 'Reset Your Password'}
              {mode === 'reset' && 'Set New Password'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'login' && 'Enter your credentials to access the pulse forecasting terminal.'}
              {mode === 'signup' && 'Join AgriPulse AI to monitor mandi arrivals & volatility signals.'}
              {mode === 'forgot' && "Enter your registered email and we'll send a verification code."}
              {mode === 'reset' && 'Enter the verification code and choose a new password.'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (Sign Up only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g.Rajesh Jha"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Verification Code (Reset Password only) */}
            {mode === 'reset' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="e.g. 123456"
                  required
                  className="w-full px-3 py-2 text-sm font-mono tracking-widest text-center text-slate-900 bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
                />
              </div>
            )}

            {/* Password (Login, Signup, Reset) */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    {mode === 'reset' ? 'New Password' : 'Password'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('forgot')}
                      className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-10 py-2 text-xs text-slate-900 bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all placeholder:text-slate-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <p className="text-[10px] text-slate-500 mt-1">Minimum 6 characters.</p>
                )}
              </div>
            )}

            {/* Confirm Password (Signup and Reset) */}
            {(mode === 'signup' || mode === 'reset') && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-10 py-2 text-xs text-slate-900 bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all placeholder:text-slate-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#1B4D31] to-[#143B25] hover:from-[#153E27] hover:to-[#0F2F1D] active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Login'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'forgot' && 'Send Verification Code'}
                    {mode === 'reset' && 'Reset Password'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fill Pill (Login Mode Only) */}
          {mode === 'login' && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="bg-[#F2F8F4] border border-[#D2E7D8] rounded-xl p-3 flex items-center justify-between gap-2">
                <div className="text-left">
                  <div className="text-[11px] font-bold text-emerald-950 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-700" />
                    <span>Quick Demo Credentials</span>
                  </div>
                  <div className="text-[10px] text-emerald-800 font-mono mt-0.5">
                    heenal@agripulse.ai
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  className="px-2.5 py-1 text-[10px] font-semibold text-[#1B4D31] bg-white hover:bg-emerald-50 border border-emerald-300 rounded-lg shadow-2xs transition-colors shrink-0"
                >
                  Fill Demo
                </button>
              </div>
            </div>
          )}

          {/* Alternate Mode Navigation Footer */}
          <div className="mt-6 text-center text-xs text-slate-500">
            {mode === 'login' && (
              <div>
                <span>Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('signup')}
                  className="font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
                >
                  Create Account
                </button>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <span>Already have an account? </span>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
                >
                  Login
                </button>
              </div>
            )}

            {(mode === 'forgot' || mode === 'reset') && (
              <div>
                <span>Remember your password? </span>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
                >
                  Return to Login
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Security & Platform Badges */}
        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Encrypted Session</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
            <span>Verified CatBoost ML</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1">
            <Leaf className="w-3.5 h-3.5 text-emerald-700" />
            <span>Maharashtra APMC</span>
          </div>
        </div>
      </div>
    </div>
  );
};

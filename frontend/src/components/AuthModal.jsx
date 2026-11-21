import React, { useState } from 'react';
import { X, Sparkles, Mail, Lock, User, Building, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose, initialMode = 'signup' }) => {
  const { login, register, demoLogin } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'signup' | 'login'
  const [role, setRole] = useState('candidate'); // 'candidate' | 'recruiter'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    if (mode === 'login') {
      const res = await login(email, password);
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to log in.');
      }
    } else {
      const res = await register({
        email,
        password,
        role,
        name,
        company_name: role === 'recruiter' ? companyName : ''
      });
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to sign up.');
      }
    }
    setSubmitting(false);
  };

  const handleDemo = async (demoRole) => {
    setSubmitting(true);
    await demoLogin(demoRole);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl text-left animate-fade-in">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="mb-6">
          <div className="flex items-baseline space-x-1 mb-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">remotejob</span>
            <span className="text-2xl font-extrabold text-brand-600">.io</span>
          </div>
          <p className="text-xs text-slate-500">
            {mode === 'signup' ? 'Create your free account in seconds.' : 'Welcome back! Please enter your details.'}
          </p>
        </div>

        {/* Quick 1-Click Demo Evaluation Box */}
        <div className="mb-6 p-3 rounded-2xl bg-brand-50/70 border border-brand-200">
          <div className="flex items-center space-x-1.5 text-brand-800 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Instant Demo Logins (1-Click)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('candidate')}
              className="py-1.5 px-2 rounded-xl bg-white text-slate-800 border border-brand-200 text-[11px] font-semibold hover:bg-brand-100/50 transition-colors text-center shadow-xs"
            >
              Candidate
            </button>
            <button
              type="button"
              onClick={() => handleDemo('recruiter')}
              className="py-1.5 px-2 rounded-xl bg-white text-slate-800 border border-brand-200 text-[11px] font-semibold hover:bg-brand-100/50 transition-colors text-center shadow-xs"
            >
              Recruiter
            </button>
            <button
              type="button"
              onClick={() => handleDemo('admin')}
              className="py-1.5 px-2 rounded-xl bg-white text-slate-800 border border-brand-200 text-[11px] font-semibold hover:bg-brand-100/50 transition-colors text-center shadow-xs"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Mode Toggle (Sign Up / Log In) */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 border border-slate-200/80">
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Log In
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Sign Up Role Choice */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">I am registering as</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('candidate')}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    role === 'candidate'
                      ? 'border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Candidate / Job Seeker
                </button>
                <button
                  type="button"
                  onClick={() => setRole('recruiter')}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    role === 'recruiter'
                      ? 'border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Recruiter / Company
                </button>
              </div>
            </div>
          )}

          {/* Full Name for Sign Up */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          )}

          {/* Company Name if Recruiter */}
          {mode === 'signup' && role === 'recruiter' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. TechNova Global"
                  className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-full text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all hover:shadow transform active:scale-95 disabled:opacity-50"
          >
            {submitting ? 'Please wait...' : mode === 'signup' ? 'Create Free Account' : 'Log In'}
          </button>
        </form>

        {/* Free Assurance footnote */}
        <p className="mt-5 text-center text-[11px] text-slate-400">
          100% Free Forever • No Credit Card Required • Blind Hiring Guaranteed
        </p>

      </div>
    </div>
  );
};

export default AuthModal;

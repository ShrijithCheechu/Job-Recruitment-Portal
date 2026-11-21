import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, Bell, User, LogOut, ChevronDown, 
  Menu, X, Sparkles, PlusCircle, CheckCircle, Shield
} from 'lucide-react';

const Navbar = ({ onOpenAuth, onOpenPostJob, activeTab, setActiveTab, onOpenNotifications }) => {
  const { user, logout, isAuthenticated, isCandidate, isRecruiter, isAdmin, unreadNotifications, demoLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const handleDemoSwitch = async (role) => {
    await demoLogin(role);
    setDemoMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo - Matching reference exact logo design */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shadow-sm transition-transform hover:scale-105">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold tracking-tight text-slate-900 font-sans">remotejob</span>
              <span className="text-2xl font-extrabold text-brand-600 font-sans">.io</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => setActiveTab('home')}
              className={`text-sm font-medium transition-colors ${activeTab === 'home' ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Jobs
            </button>

            {/* Insights Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setInsightsOpen(!insightsOpen)}
                onBlur={() => setTimeout(() => setInsightsOpen(false), 200)}
                className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                <span>Insights</span>
                <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${insightsOpen ? 'rotate-180' : ''}`} />
              </button>

              {insightsOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-card border border-slate-100 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 text-xs font-semibold uppercase text-slate-400">Market Data</div>
                  <a href="#featured" onClick={() => setInsightsOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Global Remote Salary Trends</a>
                  <a href="#talent" onClick={() => setInsightsOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Top Demanded Tech Skills</a>
                  <a href="#how-it-works" onClick={() => setInsightsOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Blind Hiring Benchmark</a>
                </div>
              )}
            </div>

            {/* If authenticated, Dashboard tab */}
            {isAuthenticated && (
              <button 
                onClick={() => setActiveTab('workspace')}
                className={`text-sm font-medium transition-colors flex items-center space-x-1 ${activeTab === 'workspace' ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <span>
                  {isAdmin ? 'Admin Console' : isRecruiter ? 'Recruiter Portal' : 'My Candidate Hub'}
                </span>
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
              </button>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Quick Demo Role Switcher for seamless evaluation */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                onBlur={() => setTimeout(() => setDemoMenuOpen(false), 200)}
                className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
                title="Switch demo profile instantly"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" />
                <span>Demo Switcher</span>
                <ChevronDown className="w-3 h-3 ml-1 text-slate-400" />
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lift border border-slate-100 p-2 z-50 animate-fade-in text-left">
                  <div className="text-[11px] font-semibold text-slate-400 px-3 py-1 uppercase">Switch Demo Account</div>
                  <button
                    onClick={() => handleDemoSwitch('candidate')}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-brand-50 hover:text-brand-700 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">Alex Morgan</div>
                      <div className="text-slate-400">Candidate (React/Python)</div>
                    </div>
                    {isCandidate && <CheckCircle className="w-3.5 h-3.5 text-brand-600" />}
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('recruiter')}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-brand-50 hover:text-brand-700 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">TechNova Global</div>
                      <div className="text-slate-400">Recruiter / Employer</div>
                    </div>
                    {isRecruiter && <CheckCircle className="w-3.5 h-3.5 text-brand-600" />}
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('admin')}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-brand-50 hover:text-brand-700 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">Administrator</div>
                      <div className="text-slate-400">Platform & Audit</div>
                    </div>
                    {isAdmin && <CheckCircle className="w-3.5 h-3.5 text-brand-600" />}
                  </button>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* Post Job CTA for recruiters */}
                {isRecruiter && (
                  <button
                    onClick={onOpenPostJob}
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    Post Vacancy
                  </button>
                )}

                {/* Notifications Bell */}
                <button
                  onClick={onOpenNotifications}
                  className="relative p-2 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    onBlur={() => setTimeout(() => setUserDropdownOpen(false), 200)}
                    className="flex items-center space-x-2 p-1 pl-2 pr-3 rounded-full border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50/50"
                  >
                    <div className="w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
                      {user.email[0].toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-slate-700 max-w-[100px] truncate">
                      {user.email.split('@')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lift border border-slate-100 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-brand-100 text-brand-800">
                          {user.role}
                        </span>
                      </div>
                      <button
                        onClick={() => { setActiveTab('workspace'); setUserDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                      >
                        <User className="w-4 h-4 mr-2 text-slate-400" />
                        Dashboard
                      </button>
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-2 text-red-400" />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all hover:shadow-md transform active:scale-95"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2.5 rounded-full text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  Log In
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3">
          <button 
            onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 font-medium text-slate-700"
          >
            Jobs
          </button>
          {isAuthenticated && (
            <button 
              onClick={() => { setActiveTab('workspace'); setMobileMenuOpen(false); }}
              className="block w-full text-left py-2 font-medium text-brand-600"
            >
              Dashboard ({user.role})
            </button>
          )}
          <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
            {isAuthenticated ? (
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="w-full text-center py-2.5 rounded-full bg-slate-100 text-slate-700 font-semibold"
              >
                Log Out
              </button>
            ) : (
              <>
                <button
                  onClick={() => { onOpenAuth('signup'); setMobileMenuOpen(false); }}
                  className="w-full text-center py-2.5 rounded-full bg-brand-600 text-white font-semibold"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                  className="w-full text-center py-2.5 rounded-full border border-slate-200 text-slate-700 font-medium"
                >
                  Log In
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

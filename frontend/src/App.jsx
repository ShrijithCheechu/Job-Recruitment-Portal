import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturedOpportunities from './components/FeaturedOpportunities';
import DiscoverExpertTalent from './components/DiscoverExpertTalent';
import HowItWorks from './components/HowItWorks';
import FreeBanner from './components/FreeBanner';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';

import JobDetailModal from './components/JobDetailModal';
import AuthModal from './components/AuthModal';
import PostJobModal from './components/PostJobModal';
import NotificationsDrawer from './components/NotificationsDrawer';

import CandidateWorkspace from './components/CandidateWorkspace';
import RecruiterWorkspace from './components/RecruiterWorkspace';
import AdminWorkspace from './components/AdminWorkspace';

import { useAuth } from './context/AuthContext';
import { jobsAPI, publicAPI, recruiterAPI } from './services/api';

function App() {
  const { user, isCandidate, isRecruiter, isAdmin, isAuthenticated, setUnreadNotifications } = useAuth();
  
  const [activeNavTab, setActiveNavTab] = useState('home'); // 'home' | 'workspace'
  const [jobs, setJobs] = useState([]);
  const [talent, setTalent] = useState([]);
  const [faqs, setFaqs] = useState([]);
  
  // Modals state
  const [selectedJob, setSelectedJob] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('signup');
  const [postJobOpen, setPostJobOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    loadPublicData();
  }, [user]);

  const loadPublicData = async () => {
    try {
      const [jobsRes, talentRes, faqsRes] = await Promise.all([
        jobsAPI.getJobs().catch(() => ({ data: [] })),
        recruiterAPI.getTalent().catch(() => ({ data: [] })),
        publicAPI.getFAQs().catch(() => ({ data: [] }))
      ]);

      setJobs(jobsRes.data || []);
      setTalent(talentRes.data || []);
      setFaqs(faqsRes.data || []);
    } catch (err) {
      console.error("Failed to load initial data", err);
    }
  };

  const handleOpenAuth = (mode = 'signup') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  const handleSaveToggle = async (jobId) => {
    if (!isAuthenticated) {
      handleOpenAuth('login');
      return;
    }
    try {
      await jobsAPI.saveJobToggle(jobId);
      loadPublicData();
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob({ ...selectedJob, is_saved: !selectedJob.is_saved });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-brand-100 selection:text-brand-800">
      
      {/* 1. Navbar */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onOpenPostJob={() => setPostJobOpen(true)}
        activeTab={activeNavTab}
        setActiveTab={setActiveNavTab}
        onOpenNotifications={() => setNotificationsOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeNavTab === 'home' ? (
          <>
            {/* 2. Hero Section */}
            <HeroSection
              onHireClick={() => {
                if (isRecruiter) {
                  setPostJobOpen(true);
                } else if (!isAuthenticated) {
                  handleOpenAuth('signup');
                } else {
                  setActiveNavTab('workspace');
                }
              }}
              onGetHiredClick={() => {
                const el = document.getElementById('featured');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* 3. Featured Opportunities */}
            <FeaturedOpportunities
              jobs={jobs}
              talent={talent}
              onSelectJob={(job) => setSelectedJob(job)}
              onSelectTalent={(person) => {
                if (isRecruiter) setActiveNavTab('workspace');
                else handleOpenAuth('signup');
              }}
              onApplyClick={(job) => {
                if (!isAuthenticated) handleOpenAuth('signup');
                else setSelectedJob(job);
              }}
            />

            {/* 4. Discover Expert Talent */}
            <DiscoverExpertTalent
              onSelectCategory={(catSlug) => {
                const el = document.getElementById('featured');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* 5. How It Works */}
            <HowItWorks />

            {/* 6. 100% Free Banner */}
            <FreeBanner />

            {/* 7. Frequently Asked Questions */}
            <FAQSection faqs={faqs} />
          </>
        ) : (
          /* Role-Based Authenticated Workspaces */
          <div className="animate-fade-in">
            {isAdmin ? (
              <AdminWorkspace />
            ) : isRecruiter ? (
              <RecruiterWorkspace
                onOpenPostJob={() => setPostJobOpen(true)}
                onSelectJob={(job) => setSelectedJob(job)}
              />
            ) : (
              <CandidateWorkspace
                onSelectJob={(job) => setSelectedJob(job)}
              />
            )}
          </div>
        )}
      </main>

      {/* 8. Footer */}
      <Footer />

      {/* Modals & Overlays */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApplied={() => {
            loadPublicData();
          }}
          onSaveToggle={handleSaveToggle}
        />
      )}

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authInitialMode}
        onClose={() => setAuthModalOpen(false)}
      />

      <PostJobModal
        isOpen={postJobOpen}
        onClose={() => setPostJobOpen(false)}
        onJobCreated={() => {
          loadPublicData();
          setActiveNavTab('workspace');
        }}
      />

      <NotificationsDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onRefreshCount={(count) => setUnreadNotifications(count)}
      />

    </div>
  );
}

export default App;

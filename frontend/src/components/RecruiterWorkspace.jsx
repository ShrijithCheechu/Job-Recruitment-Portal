import React, { useState, useEffect } from 'react';
import { 
  Building2, PlusCircle, Users, Briefcase, Eye, 
  Calendar, CheckCircle, Clock, Shield, Sparkles, AlertCircle, 
  FileText, Star, Lock, Unlock, ExternalLink
} from 'lucide-react';
import { recruiterAPI, interviewAPI, jobsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const RecruiterWorkspace = ({ onOpenPostJob, onSelectJob }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'jobs' | 'talent'
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applications, setApplications] = useState([]);
  const [talent, setTalent] = useState([]);
  const [loading, setLoading] = useState(true);

  // Identity Reveal Modal
  const [revealTargetApp, setRevealTargetApp] = useState(null);
  const [revealReason, setRevealReason] = useState('');
  const [revealing, setRevealing] = useState(false);

  // Schedule Interview Modal
  const [interviewTargetApp, setInterviewTargetApp] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    scheduled_at: '',
    duration_minutes: 45,
    mode: 'Video',
    meeting_link: 'https://meet.google.com/xyz-rec-portal',
    notes: ''
  });
  const [scheduling, setScheduling] = useState(false);

  // Candidate Details Drawer/Modal
  const [inspectApp, setInspectApp] = useState(null);

  useEffect(() => {
    loadRecruiterData();
  }, []);

  const loadRecruiterData = async () => {
    setLoading(true);
    try {
      const [jobsRes, talentRes] = await Promise.all([
        recruiterAPI.getJobs().catch(() => ({ data: [] })),
        recruiterAPI.getTalent().catch(() => ({ data: [] }))
      ]);

      setJobs(jobsRes.data || []);
      setTalent(talentRes.data || []);

      if (jobsRes.data && jobsRes.data.length > 0) {
        const firstId = jobsRes.data[0].id;
        setSelectedJobId(firstId);
        loadApplicationsForJob(firstId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadApplicationsForJob = async (jobId) => {
    try {
      const res = await recruiterAPI.getJobApplications(jobId);
      setApplications(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleJobSelectChange = (jobId) => {
    setSelectedJobId(jobId);
    loadApplicationsForJob(jobId);
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await recruiterAPI.updateApplicationStatus(appId, {
        status: newStatus,
        comment: `Moved status to ${newStatus}`
      });
      loadApplicationsForJob(selectedJobId);
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleRevealConfirm = async () => {
    if (!revealTargetApp) return;
    setRevealing(true);
    try {
      await recruiterAPI.revealIdentity(revealTargetApp.id, revealReason || 'Shortlisted candidate for detailed interview.');
      setRevealTargetApp(null);
      setRevealReason('');
      loadApplicationsForJob(selectedJobId);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reveal candidate.');
    } finally {
      setRevealing(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!interviewTargetApp) return;
    setScheduling(true);
    try {
      await recruiterAPI.scheduleInterview(interviewTargetApp.id, interviewForm);
      setInterviewTargetApp(null);
      loadApplicationsForJob(selectedJobId);
      alert("Interview scheduled and invite sent!");
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to schedule interview.');
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      
      {/* Recruiter Workspace Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Recruiter & Hiring Portal
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Blind Hiring Active
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Evaluate applicants objectively based on skills, compatibility score, and anonymous profiles.
          </p>
        </div>

        <button
          onClick={onOpenPostJob}
          className="inline-flex items-center px-6 py-3 rounded-full text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all hover:shadow"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Post New Vacancy
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 mb-8 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap flex items-center space-x-2 ${
            activeTab === 'pipeline'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Applicant Pipeline</span>
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap flex items-center space-x-2 ${
            activeTab === 'jobs'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>My Vacancies ({jobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('talent')}
          className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap flex items-center space-x-2 ${
            activeTab === 'talent'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Candidate Discovery Pool</span>
        </button>
      </div>

      {/* TAB 1: Applicant Pipeline (Blind Hiring Engine) */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          
          {/* Job Picker Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Vacancy:</span>
              <select
                value={selectedJobId}
                onChange={(e) => handleJobSelectChange(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title} ({j.applications_count || 0} applicants)</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <Shield className="w-4 h-4 text-brand-600" />
              <span>Names & photos hidden in blind mode until revealed or shortlisted.</span>
            </div>
          </div>

          {/* Applications list */}
          <div className="space-y-4">
            {applications.length > 0 ? (
              applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft hover:shadow-card transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center space-x-3">
                      
                      {/* Name / Anonymous Pseudonym */}
                      <div className="flex items-center space-x-2">
                        {app.identity_revealed ? (
                          <Unlock className="w-4 h-4 text-emerald-600" title="Identity revealed" />
                        ) : (
                          <Lock className="w-4 h-4 text-amber-500" title="Blind screening active" />
                        )}
                        <h3 className="text-base font-bold text-slate-900">
                          {app.candidate_name}
                        </h3>
                      </div>

                      {/* Match Score Badge */}
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        ★ {app.match_score}% Compatibility Match
                      </span>
                    </div>

                    {/* Headline and email (if revealed) */}
                    <p className="text-xs text-slate-600">
                      {app.candidate_headline} • <span className="text-slate-400">{app.candidate_email}</span>
                    </p>

                    {/* Matching skills list */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(app.candidate_skills || []).slice(0, 6).map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div className="flex flex-wrap items-center gap-3">
                    
                    {/* View Resume / Inspection */}
                    <button
                      onClick={() => setInspectApp(app)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
                    >
                      Inspect Skills & Resume
                    </button>

                    {/* Reveal Candidate Identity CTA */}
                    {!app.identity_revealed ? (
                      <button
                        onClick={() => setRevealTargetApp(app)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                      >
                        Reveal Identity
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 flex items-center">
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Revealed
                      </span>
                    )}

                    {/* Schedule Interview */}
                    <button
                      onClick={() => {
                        setInterviewTargetApp(app);
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow.setHours(15, 0, 0, 0);
                        setInterviewForm({
                          ...interviewForm,
                          scheduled_at: tomorrow.toISOString().slice(0, 16)
                        });
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100"
                    >
                      Schedule Interview
                    </button>

                    {/* Status Select */}
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className="text-xs px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white text-slate-800 focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="Applied">Applied</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="Offered">Offered</option>
                      <option value="Hired">Hired</option>
                      <option value="Rejected">Rejected</option>
                    </select>

                  </div>

                </div>
              ))
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700">No applications received yet for this vacancy</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Once candidates apply, they will appear here with calculated compatibility scores and blind privacy masks.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: My Jobs */}
      {activeTab === 'jobs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => onSelectJob(job)}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft hover:shadow-card cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-100 text-brand-800">
                    {job.status}
                  </span>
                  <span className="text-xs text-slate-400">{job.work_mode}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{job.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">{job.description}</p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold text-brand-700">{job.applications_count || 0} Applicants</span>
                <span>Manage &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Candidate Discovery Pool */}
      {activeTab === 'talent' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {talent.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm">
                  {t.full_name ? t.full_name[0] : '#'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.full_name || t.anonymous_name}</h4>
                  <p className="text-xs text-slate-500">{t.headline}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">{t.bio}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {(t.skills || []).map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REVEAL CANDIDATE MODAL (BLD-06) */}
      {revealTargetApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-left animate-fade-in">
            <div className="flex items-center space-x-2 text-amber-600 mb-2">
              <Unlock className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Reveal Candidate Identity</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              You are about to unlock the identity of <strong>{revealTargetApp.anonymous_code}</strong>.
              This will disclose their full name, contact information, and unredacted resume. An audit log entry will be created and the candidate will be notified.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shortlisting Reason (Audit Trail)</label>
              <input
                type="text"
                value={revealReason}
                onChange={(e) => setRevealReason(e.target.value)}
                placeholder="e.g. Strong matching skill score (88%) for React role"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setRevealTargetApp(null)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={revealing}
                onClick={handleRevealConfirm}
                className="px-5 py-2 rounded-full text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm"
              >
                {revealing ? 'Unlocking...' : 'Confirm & Reveal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE INTERVIEW MODAL (INT-01) */}
      {interviewTargetApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-left animate-fade-in">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Schedule Candidate Interview
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              For: {interviewTargetApp.candidate_name} ({interviewTargetApp.job_title})
            </p>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={interviewForm.scheduled_at}
                  onChange={(e) => setInterviewForm({ ...interviewForm, scheduled_at: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    value={interviewForm.duration_minutes}
                    onChange={(e) => setInterviewForm({ ...interviewForm, duration_minutes: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mode</label>
                  <select
                    value={interviewForm.mode}
                    onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Video">Video Call</option>
                    <option value="Phone">Phone</option>
                    <option value="In-person">In-person</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting Link</label>
                <input
                  type="url"
                  value={interviewForm.meeting_link}
                  onChange={(e) => setInterviewForm({ ...interviewForm, meeting_link: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setInterviewTargetApp(null)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="px-5 py-2 rounded-full text-xs font-bold text-white bg-brand-600 hover:bg-brand-700"
                >
                  {scheduling ? 'Scheduling...' : 'Send Interview Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT RESUME / APPLICATION MODAL */}
      {inspectApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl text-left animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{inspectApp.candidate_name}</h3>
                <span className="text-xs text-brand-600 font-semibold">{inspectApp.match_score}% Compatibility Match</span>
              </div>
              <button onClick={() => setInspectApp(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Cover Note</h4>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-line">
                  {inspectApp.cover_letter || "No cover letter provided."}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {inspectApp.identity_revealed ? "Full Resume Text" : "Redacted Resume (Blind Screening View)"}
                </h4>
                <pre className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap font-sans leading-relaxed">
                  {inspectApp.resume_text || "No resume text extracted."}
                </pre>
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-slate-100 text-right">
              <button
                onClick={() => setInspectApp(null)}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RecruiterWorkspace;

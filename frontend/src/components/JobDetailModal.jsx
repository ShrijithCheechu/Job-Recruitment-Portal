import React, { useState } from 'react';
import { X, Building2, MapPin, Briefcase, Clock, DollarSign, Bookmark, CheckCircle2, AlertCircle, FileText, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { jobsAPI, candidateAPI } from '../services/api';
import confetti from 'canvas-confetti';

const JobDetailModal = ({ job, onClose, onApplied, onSaveToggle }) => {
  const { user, isCandidate, isAuthenticated } = useAuth();
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Fetch candidate resumes when apply section is opened
  const handleOpenApply = async () => {
    setApplying(true);
    if (isCandidate) {
      setLoadingResumes(true);
      try {
        const res = await candidateAPI.getResumes();
        setResumes(res.data);
        const def = res.data.find(r => r.is_default) || res.data[0];
        if (def) setSelectedResumeId(def.id);
      } catch (e) {
        console.error("Failed to load resumes", e);
      } finally {
        setLoadingResumes(false);
      }
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await jobsAPI.applyToJob(job.id, {
        resume_id: selectedResumeId || null,
        cover_letter: coverLetter
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      setAppliedSuccess(true);
      if (onApplied) onApplied(job.id);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to submit application.');
    }
  };

  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col text-left animate-fade-in">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-lg shadow-sm">
              {job.company_name ? job.company_name[0] : 'J'}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{job.title}</h2>
              <div className="flex items-center space-x-3 text-xs sm:text-sm text-slate-500 mt-1">
                <span className="font-medium text-slate-700">{job.company_name}</span>
                <span>•</span>
                <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" />{job.location}</span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">{job.work_mode}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Compatibility Score Banner for Candidates */}
          {isCandidate && job.match_score !== null && job.match_score !== undefined && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Skill Compatibility Score</span>
                </div>
                <div className="text-2xl font-extrabold text-emerald-700 mt-0.5">
                  {job.match_score}% Match
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Calculated based on your verified skills and resume keywords.
                </p>
              </div>

              {/* Matching & Missing Skills preview */}
              <div className="space-y-1.5 text-xs">
                {job.matching_skills && job.matching_skills.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[11px] font-bold text-emerald-700">Matched:</span>
                    {job.matching_skills.slice(0, 3).map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-medium">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                )}
                {job.missing_skills && job.missing_skills.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[11px] font-bold text-slate-500">Missing:</span>
                    {job.missing_skills.slice(0, 2).map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Key Job Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Work Mode</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{job.work_mode}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Job Type</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{job.job_type}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Experience</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{job.experience_level}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Hiring Mode</span>
              <p className="text-sm font-bold text-brand-700 mt-0.5">{job.is_blind ? 'Blind Screening' : 'Standard'}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Job Description</h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Requirements</h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{job.requirements}</p>
            </div>
          )}

          {/* Required Skills */}
          {job.job_skills && job.job_skills.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Target Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.job_skills.map((s, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      s.is_required
                        ? 'bg-brand-50 text-brand-700 border border-brand-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {s.name} {s.is_required ? '(Required)' : '(Preferred)'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Apply Form Expansion */}
          {applying && (
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center space-x-2 text-brand-700 font-bold text-sm">
                <FileText className="w-4 h-4" />
                <span>Submit Your Application</span>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {errorMsg}
                </div>
              )}

              {appliedSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-center font-bold text-sm flex items-center justify-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Application Submitted! Redirecting...</span>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Select Resume</label>
                    {resumes.length > 0 ? (
                      <select
                        value={selectedResumeId}
                        onChange={(e) => setSelectedResumeId(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        {resumes.map(r => (
                          <option key={r.id} value={r.id}>{r.title} {r.is_default ? '(Default)' : ''}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-xs text-amber-600">
                        {loadingResumes ? "Loading resumes..." : "You have no uploaded resume. Your profile skills will be submitted automatically."}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Brief Note / Cover Letter (Optional)</label>
                    <textarea
                      rows={3}
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Highlight relevant projects or why you're a great fit..."
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm"
                    >
                      Confirm Application
                    </button>
                    <button
                      type="button"
                      onClick={() => setApplying(false)}
                      className="px-4 py-2.5 rounded-full text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Modal Actions Footer */}
        {!applying && (
          <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <button
              onClick={() => onSaveToggle && onSaveToggle(job.id)}
              className={`p-2.5 rounded-full border transition-colors flex items-center space-x-1.5 text-xs font-semibold ${
                job.is_saved
                  ? 'border-brand-300 text-brand-700 bg-brand-50'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${job.is_saved ? 'fill-brand-600' : ''}`} />
              <span>{job.is_saved ? 'Saved' : 'Save Job'}</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleOpenApply}
                className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all hover:shadow-md transform active:scale-95"
              >
                {isCandidate ? 'Apply Now' : isAuthenticated ? 'Apply (Candidate Only)' : 'Apply to this Role'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default JobDetailModal;

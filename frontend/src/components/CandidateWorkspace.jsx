import React, { useState, useEffect } from 'react';
import { 
  User, FileText, Briefcase, Calendar, Bookmark, Upload, 
  CheckCircle2, Clock, MapPin, Sparkles, ExternalLink, Trash2, 
  ChevronRight, AlertCircle, CalendarDays, Download
} from 'lucide-react';
import { candidateAPI, interviewAPI, jobsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CandidateWorkspace = ({ onSelectJob }) => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'resumes' | 'interviews' | 'profile' | 'saved'
  
  // Data states
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Resume Upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');

  // Status History Modal state
  const [selectedAppHistory, setSelectedAppHistory] = useState(null);

  // Profile Edit state
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    headline: '',
    bio: '',
    location: '',
    phone: '',
    skills: []
  });
  const [newSkillInput, setNewSkillInput] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [profRes, appsRes, resumesRes, intsRes, savedRes] = await Promise.all([
        candidateAPI.getProfile().catch(() => ({ data: null })),
        candidateAPI.getApplications().catch(() => ({ data: [] })),
        candidateAPI.getResumes().catch(() => ({ data: [] })),
        interviewAPI.getInterviews().catch(() => ({ data: [] })),
        jobsAPI.getSavedJobs().catch(() => ({ data: [] }))
      ]);

      if (profRes.data) {
        setProfile(profRes.data);
        setProfileForm({
          full_name: profRes.data.full_name || '',
          headline: profRes.data.headline || '',
          bio: profRes.data.bio || '',
          location: profRes.data.location || '',
          phone: profRes.data.phone || '',
          skills: profRes.data.skills || []
        });
      }
      setApplications(appsRes.data || []);
      setResumes(resumesRes.data || []);
      setInterviews(intsRes.data || []);
      setSavedJobs(savedRes.data || []);
    } catch (err) {
      console.error("Error loading candidate workspace data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError("Please choose a PDF resume file.");
      return;
    }
    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', uploadTitle || uploadFile.name);
    formData.append('is_default', 'true');

    try {
      const res = await candidateAPI.uploadResume(formData);
      setUploadSuccess(res.data.message || 'Resume uploaded and skills extracted successfully!');
      setUploadFile(null);
      setUploadTitle('');
      loadAllData();
      refreshUser();
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Failed to upload and parse resume.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSavedMsg('');
    try {
      const res = await candidateAPI.updateProfile(profileForm);
      setProfile(res.data);
      setProfileSavedMsg('Profile updated successfully!');
      refreshUser();
      setTimeout(() => setProfileSavedMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const addSkill = (e) => {
    e.preventDefault();
    if (newSkillInput.trim() && !profileForm.skills.includes(newSkillInput.trim())) {
      setProfileForm({
        ...profileForm,
        skills: [...profileForm.skills, newSkillInput.trim()]
      });
      setNewSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfileForm({
      ...profileForm,
      skills: profileForm.skills.filter(s => s !== skillToRemove)
    });
  };

  const handleWithdraw = async (appId) => {
    if (confirm("Are you sure you want to withdraw this application?")) {
      try {
        await candidateAPI.withdrawApplication(appId);
        loadAllData();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to withdraw');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      
      {/* Workspace Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 font-bold text-2xl flex items-center justify-center shadow-xs">
            {profile?.full_name ? profile.full_name[0] : user?.email[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-900">
                {profile?.full_name || user?.email.split('@')[0]}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-800">
                Job Seeker
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {profile?.headline || 'Candidate Portal • Skill-based matching active'}
            </p>
          </div>
        </div>

        {/* Quick Stats overview */}
        <div className="flex items-center space-x-4 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6 text-center">
          <div>
            <div className="text-xl font-bold text-slate-900">{applications.length}</div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Applications</div>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div>
            <div className="text-xl font-bold text-brand-600">{interviews.length}</div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Interviews</div>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div>
            <div className="text-xl font-bold text-slate-900">{resumes.length}</div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Resumes</div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 mb-8 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap flex items-center space-x-2 ${
            activeTab === 'applications'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>My Applications ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('resumes')}
          className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap flex items-center space-x-2 ${
            activeTab === 'resumes'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Resume & Skills Parser</span>
        </button>

        <button
          onClick={() => setActiveTab('interviews')}
          className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap flex items-center space-x-2 ${
            activeTab === 'interviews'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Interviews ({interviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap flex items-center space-x-2 ${
            activeTab === 'profile'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap flex items-center space-x-2 ${
            activeTab === 'saved'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Jobs ({savedJobs.length})</span>
        </button>
      </div>

      {/* TAB 1: My Applications */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {applications.length > 0 ? (
            applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft hover:shadow-card transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-base font-bold text-slate-900">{app.job_title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      app.status === 'Applied' ? 'bg-blue-100 text-blue-800' :
                      app.status === 'Under Review' ? 'bg-amber-100 text-amber-800' :
                      app.status === 'Shortlisted' ? 'bg-emerald-100 text-emerald-800' :
                      app.status === 'Interview Scheduled' ? 'bg-purple-100 text-purple-800' :
                      app.status === 'Offered' ? 'bg-teal-100 text-teal-800' :
                      app.status === 'Hired' ? 'bg-green-100 text-green-800' :
                      app.status === 'Withdrawn' ? 'bg-slate-100 text-slate-500' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-2">
                    Company: <span className="font-semibold text-slate-700">{app.company_name}</span> • Applied: {new Date(app.applied_at).toLocaleDateString()}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      ★ {app.match_score}% Match
                    </span>
                    {app.identity_revealed ? (
                      <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-[11px] font-semibold">
                        Identity Revealed to Recruiter
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold">
                        Blind Screening Active (Anonymous)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedAppHistory(app)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    View Status Timeline
                  </button>
                  {app.status !== 'Withdrawn' && app.status !== 'Hired' && (
                    <button
                      onClick={() => handleWithdraw(app.id)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-700">No applications submitted yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Explore open vacancies and apply with your parsed resume and 1-click compatibility matching.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Resume Manager & Skill Extractor */}
      {activeTab === 'resumes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Upload Form */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-soft">
            <div className="flex items-center space-x-2 text-brand-700 font-bold text-sm mb-4">
              <Upload className="w-5 h-5" />
              <span>Upload PDF Resume</span>
            </div>

            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Our automated Python matcher reads your PDF resume, extracts detected technical skills, and matches you against open vacancies.
            </p>

            {uploadSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {uploadError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleResumeUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Resume Title</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Alex_Morgan_Fullstack_2026.pdf"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select PDF File</label>
                <input
                  type="file"
                  accept=".pdf"
                  required
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-2.5 rounded-full text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-sm disabled:opacity-50"
              >
                {uploading ? 'Extracting Skills from PDF...' : 'Upload & Extract Skills'}
              </button>
            </form>
          </div>

          {/* Uploaded Resumes List */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-base font-bold text-slate-900 mb-2">Your Uploaded Resumes</h3>
            {resumes.length > 0 ? (
              resumes.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-brand-600" />
                        <h4 className="text-sm font-bold text-slate-800">{r.title}</h4>
                        {r.is_default && (
                          <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 text-[10px] font-bold">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Uploaded on {new Date(r.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Skills detected */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Automatically Detected Skills ({r.skills?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(r.skills || []).map((s, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-slate-400">
                No resumes uploaded yet. Upload a PDF resume to enable automated skill matching.
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: Interviews */}
      {activeTab === 'interviews' && (
        <div className="space-y-4">
          {interviews.length > 0 ? (
            interviews.map((intv) => (
              <div
                key={intv.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <CalendarDays className="w-5 h-5 text-brand-600" />
                    <h3 className="text-base font-bold text-slate-900">{intv.job_title}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      {intv.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mb-2">
                    Scheduled: <span className="font-semibold text-slate-800">{new Date(intv.scheduled_at).toLocaleString()}</span> ({intv.duration_minutes} min • {intv.mode})
                  </p>

                  {intv.meeting_link && (
                    <a
                      href={intv.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
                    >
                      Join Meeting Link <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  )}
                </div>

                {/* Calendar Download (.ics) */}
                <div>
                  <a
                    href={interviewAPI.getIcsUrl(intv.id)}
                    className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Export (.ics)
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-700">No interviews scheduled yet</h3>
              <p className="text-xs text-slate-400 mt-1">
                When recruiters shortlist your profile, scheduled interview meetings will appear here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Profile Settings */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft max-w-3xl">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Edit Candidate Profile</h3>

          {profileSavedMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {profileSavedMsg}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={profileForm.location}
                  onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                  placeholder="e.g. Lalitpur, Nepal"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Headline</label>
              <input
                type="text"
                value={profileForm.headline}
                onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                placeholder="e.g. Fullstack React & Python Engineer"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Short Bio</label>
              <textarea
                rows={3}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Describe your background and expertise..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Interactive Skills Editor */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Verified Skills</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {profileForm.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1.5 text-brand-400 hover:text-brand-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  placeholder="Add skill (e.g. TypeScript, Docker)"
                  className="text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Add Skill
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: Saved Jobs */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedJobs.length > 0 ? (
            savedJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => onSelectJob(job)}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft hover:shadow-card cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="text-base font-bold text-slate-900">{job.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{job.company_name} • {job.location} • {job.work_mode}</p>
                </div>
                <button className="px-4 py-2 rounded-full text-xs font-bold bg-brand-600 text-white">
                  View Opportunity &rarr;
                </button>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400">
              No saved jobs. Click the bookmark icon on any job card to save it for later.
            </div>
          )}
        </div>
      )}

      {/* Status History Modal (APP-07 Timeline) */}
      {selectedAppHistory && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl text-left animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Application Timeline</h3>
                <p className="text-xs text-slate-500">{selectedAppHistory.job_title} • {selectedAppHistory.company_name}</p>
              </div>
              <button
                onClick={() => setSelectedAppHistory(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Timeline */}
            <div className="space-y-6 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {(selectedAppHistory.status_history || []).map((h, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-brand-600 ring-4 ring-white"></div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">{h.new_status}</span>
                    <span className="text-[10px] text-slate-400 ml-2">{new Date(h.created_at).toLocaleString()}</span>
                    <p className="text-xs text-slate-500 mt-0.5">{h.comment}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedAppHistory(null)}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CandidateWorkspace;

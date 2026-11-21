import React, { useState } from 'react';
import { X, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { jobsAPI } from '../services/api';

const PostJobModal = ({ isOpen, onClose, onJobCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    category_id: '',
    work_mode: 'Remote',
    job_type: 'Full-time',
    experience_level: 'Mid Level',
    location: 'Lalitpur, Nepal',
    description: '',
    requirements: '',
    is_blind: true,
  });

  const [skills, setSkills] = useState([
    { name: 'React', is_required: true },
    { name: 'JavaScript', is_required: true }
  ]);
  const [newSkill, setNewSkill] = useState('');
  const [isReq, setIsReq] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim()) {
      setSkills([...skills, { name: newSkill.trim(), is_required: isReq }]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      await jobsAPI.createJob({
        ...formData,
        skills
      });
      if (onJobCreated) onJobCreated();
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to post vacancy.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl text-left animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Post a New Vacancy</h2>
            <p className="text-xs text-slate-500 mt-0.5">Publish an opportunity to attract skilled global professionals.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Senior Fullstack Engineer"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Display Name</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="e.g. TechNova Global"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Lalitpur, Nepal / Remote"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Work Mode</label>
              <select
                value={formData.work_mode}
                onChange={(e) => setFormData({ ...formData, work_mode: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Type</label>
              <select
                value={formData.job_type}
                onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Experience</label>
              <select
                value={formData.experience_level}
                onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior Level">Senior Level</option>
                <option value="Lead / Principal">Lead / Principal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description</label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline responsibilities and role objectives..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Requirements & Qualifications</label>
            <textarea
              rows={3}
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="Required background, tools, methodologies..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Skill Requirements Builder */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Required & Preferred Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((s, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    s.is_required
                      ? 'bg-brand-50 text-brand-700 border border-brand-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {s.name} ({s.is_required ? 'Req' : 'Pref'})
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(idx)}
                    className="ml-1.5 text-slate-400 hover:text-slate-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add skill (e.g. Python, Docker)"
                className="text-xs px-3 py-2 rounded-xl border border-slate-200 flex-1"
              />
              <label className="flex items-center text-xs text-slate-600 space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isReq}
                  onChange={(e) => setIsReq(e.target.checked)}
                  className="rounded text-brand-600"
                />
                <span>Required</span>
              </label>
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200"
              >
                Add
              </button>
            </div>
          </div>

          {/* Blind Hiring Setting (BLD-01) */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-800 block">Enable Blind Hiring (Recommended)</span>
              <span className="text-[11px] text-slate-600">Candidate names, photos, and contact info are hidden during initial screening.</span>
            </div>
            <input
              type="checkbox"
              checked={formData.is_blind}
              onChange={(e) => setFormData({ ...formData, is_blind: e.target.checked })}
              className="w-5 h-5 text-emerald-600 rounded cursor-pointer"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm"
            >
              {submitting ? 'Publishing...' : 'Publish Vacancy (Free)'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default PostJobModal;

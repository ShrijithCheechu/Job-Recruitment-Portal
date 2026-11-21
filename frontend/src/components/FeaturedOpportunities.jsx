import React, { useState } from 'react';
import { Search, ChevronRight, Sparkles, MapPin, Building2, UserCheck, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CATEGORY_TABS = [
  { id: 'featured', label: 'Featured' },
  { id: 'software-engineers', label: 'Software Engineers' },
  { id: 'ui-ux', label: 'UI/UX' },
  { id: 'project-management', label: 'Project Management' },
  { id: 'accounting', label: 'Accounting' },
  { id: 'hybrid-jobs', label: 'Hybrid Jobs' },
  { id: 'international-companies', label: 'International Companies' },
  { id: 'remote', label: 'Remote' },
];

const FeaturedOpportunities = ({ jobs, talent, onSelectJob, onSelectTalent, onApplyClick }) => {
  const { isCandidate, isRecruiter } = useAuth();
  const [activeTab, setActiveTab] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('jobs'); // 'jobs' | 'people'

  // Filter jobs based on active tab and search query
  const filteredJobs = jobs.filter((job) => {
    const matchQuery = (
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.company_name && job.company_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.job_skills && job.job_skills.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    if (!matchQuery) return false;

    if (activeTab === 'featured') return job.featured || true;
    if (activeTab === 'software-engineers') return job.category_name?.toLowerCase().includes('software') || job.title.toLowerCase().includes('developer');
    if (activeTab === 'ui-ux') return job.category_name?.toLowerCase().includes('ui') || job.title.toLowerCase().includes('designer');
    if (activeTab === 'project-management') return job.category_name?.toLowerCase().includes('project') || job.title.toLowerCase().includes('manager');
    if (activeTab === 'accounting') return job.category_name?.toLowerCase().includes('account');
    if (activeTab === 'hybrid-jobs') return job.work_mode?.toLowerCase() === 'hybrid';
    if (activeTab === 'remote') return job.work_mode?.toLowerCase() === 'remote';
    return true;
  });

  // Filter talent
  const filteredTalent = talent.filter((t) => {
    return (
      t.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.skills && t.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  });

  // Badge styles corresponding to reference UI cards
  const getBadgeStyle = (index, job) => {
    const styles = [
      { bg: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: '🎨' },
      { bg: 'bg-sky-50 text-sky-600 border-sky-100', text: 'v/mec' },
      { bg: 'bg-rose-50 text-rose-600 border-rose-100', icon: '⚡' },
      { bg: 'bg-teal-50 text-teal-600 border-teal-100', text: 'M' },
    ];
    return styles[index % styles.length];
  };

  return (
    <section id="featured" className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-left mb-6">
          <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 font-normal tracking-tight">
            Featured Opportunities
          </h2>
        </div>

        {/* Search Bar with Jobs / People toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 bg-slate-50/80 rounded-full border border-slate-200/90 shadow-sm max-w-4xl mb-8">
          
          {/* Input */}
          <div className="relative flex-1 w-full flex items-center pl-4">
            <Search className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across 100+ jobs"
              className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Jobs | People Toggle */}
          <div className="flex items-center bg-white rounded-full p-1 border border-slate-200 shadow-xs flex-shrink-0">
            <button
              onClick={() => setViewMode('jobs')}
              className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                viewMode === 'jobs'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Jobs
            </button>
            <button
              onClick={() => setViewMode('people')}
              className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                viewMode === 'people'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              People
            </button>
          </div>
        </div>

        {/* Category Tabs Pill Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 scrollbar-none text-left">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Jobs Grid (4 columns on desktop matching reference) */}
        {viewMode === 'jobs' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job, index) => {
                const badge = getBadgeStyle(index, job);
                return (
                  <div
                    key={job.id}
                    onClick={() => onSelectJob(job)}
                    className="group bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft hover:shadow-lift hover:border-brand-200 transition-all duration-300 cursor-pointer flex flex-col justify-between text-left relative"
                  >
                    <div>
                      {/* Card Logo / Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs border ${badge.bg}`}>
                          {badge.text ? badge.text : badge.icon}
                        </div>
                        
                        {/* Live Compatibility Score for Candidate */}
                        {isCandidate && job.match_score !== null && job.match_score !== undefined && (
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            job.match_score >= 80 ? 'bg-emerald-100 text-emerald-800' :
                            job.match_score >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {job.match_score}% Match
                          </span>
                        )}
                      </div>

                      {/* Job Title */}
                      <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                        {job.title}
                      </h3>

                      {/* Description snippet */}
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                        {job.description}
                      </p>
                    </div>

                    {/* Card Footer: tags and arrow */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span className="font-medium text-slate-500 truncate max-w-[170px]">
                        {job.category_name || 'Tech'} – {job.location || 'Remote'}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-slate-400">
                No matching opportunities found. Try another search or category.
              </div>
            )}
          </div>
        ) : (
          /* People / Talent Discovery Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTalent.length > 0 ? (
              filteredTalent.map((person) => (
                <div
                  key={person.id}
                  onClick={() => onSelectTalent && onSelectTalent(person)}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft hover:shadow-lift transition-all cursor-pointer text-left flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm">
                        {person.full_name ? person.full_name[0] : '#'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h4 className="text-sm font-bold text-slate-900">
                            {person.full_name || person.anonymous_name}
                          </h4>
                          <Shield className="w-3.5 h-3.5 text-brand-600" title="Blind screened candidate" />
                        </div>
                        <p className="text-xs text-slate-500">{person.headline}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                      {person.bio}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(person.skills || []).slice(0, 4).map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-brand-600 font-semibold">
                    <span>{person.location || 'Remote'}</span>
                    <span>View Profile &rarr;</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-400">
                No discoverable candidates match this filter.
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
};

export default FeaturedOpportunities;

import React from 'react';
import { Code2, PenTool, BarChart3, Terminal } from 'lucide-react';

const TALENT_CATEGORIES = [
  {
    id: 1,
    title: 'Software Engineers',
    icon: Code2,
    bgClass: 'bg-[#ecfdf5] border-[#d1fae5] text-emerald-800', // Mint Green
    iconBg: 'bg-emerald-100 text-emerald-700',
    description: 'Access skilled developers proficient in modern tech stacks, from web and mobile to AI and blockchain solutions.',
    tags: ['Web dev', 'Mobile', 'Backend'],
    filterKey: 'software-engineers'
  },
  {
    id: 2,
    title: 'Creative Designer',
    icon: PenTool,
    bgClass: 'bg-[#f5f3ff] border-[#ede9fe] text-purple-900', // Lavender
    iconBg: 'bg-purple-100 text-purple-700',
    description: 'Find talented designers who bring aesthetics with functionality to create engaging digital experiences.',
    tags: ['UI/UX', 'Brand', 'Motion'],
    filterKey: 'ui-ux'
  },
  {
    id: 3,
    title: 'Project Leaders',
    icon: BarChart3,
    bgClass: 'bg-[#f0f9ff] border-[#e0f2fe] text-sky-900', // Sky Blue
    iconBg: 'bg-sky-100 text-sky-700',
    description: 'Collaborate with experienced managers who excel at driving projects from concept to successful delivery.',
    tags: ['Agile', 'Scrum', 'Strategy'],
    filterKey: 'project-management'
  },
  {
    id: 4,
    title: 'Software Engineers',
    icon: Terminal,
    bgClass: 'bg-[#fff1f2] border-[#ffe4e6] text-rose-900', // Pastel Pink / Coral
    iconBg: 'bg-rose-100 text-rose-700',
    description: 'Access skilled developers proficient in modern tech stacks, from web and mobile to AI and blockchain solutions.',
    tags: ['Web dev', 'Mobile', 'Backend'],
    filterKey: 'software-engineers'
  }
];

const DiscoverExpertTalent = ({ onSelectCategory }) => {
  return (
    <section id="talent" className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        
        {/* Heading & Subtitle */}
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 font-normal tracking-tight mb-2">
            Discover Expert Talent
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-normal">
            Connect with top-tier professionals who can transform your ideas into reality.
          </p>
        </div>

        {/* 4 Pastel Tinted Cards matching reference UI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TALENT_CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                onClick={() => onSelectCategory && onSelectCategory(cat.filterKey)}
                className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-card hover:-translate-y-1 cursor-pointer flex flex-col justify-between ${cat.bgClass}`}
              >
                <div>
                  {/* Icon badge */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${cat.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {cat.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed mb-6 font-normal">
                    {cat.description}
                  </p>
                </div>

                {/* Skill tag pills */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {cat.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/80 backdrop-blur-xs text-slate-700 shadow-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default DiscoverExpertTalent;

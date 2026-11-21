import React, { useState } from 'react';
import { UserPlus, Search, Handshake, ChevronRight, Building, FileCheck, Users } from 'lucide-react';

const HowItWorks = () => {
  const [role, setRole] = useState('candidate'); // 'candidate' | 'recruiter'

  const candidateSteps = [
    {
      num: 1,
      title: 'Create Account',
      description: 'Sign up for free and build your professional profile.',
      icon: UserPlus,
      iconColor: 'bg-emerald-100 text-emerald-600',
    },
    {
      num: 2,
      title: 'Explore Opportunities',
      description: 'Discover jobs or find skilled professionals.',
      icon: Search,
      iconColor: 'bg-cyan-100 text-cyan-600',
    },
    {
      num: 3,
      title: 'Connect & Grow',
      description: 'Apply for jobs or connect with suitable candidates.',
      icon: Handshake,
      iconColor: 'bg-emerald-100 text-emerald-600',
    },
  ];

  const recruiterSteps = [
    {
      num: 1,
      title: 'Create Account',
      description: 'Register your company and set up your hiring profile.',
      icon: Building,
      iconColor: 'bg-emerald-100 text-emerald-600',
    },
    {
      num: 2,
      title: 'Explore Opportunities',
      description: 'Post job openings or discover top verified candidates.',
      icon: FileCheck,
      iconColor: 'bg-cyan-100 text-cyan-600',
    },
    {
      num: 3,
      title: 'Connect & Grow',
      description: 'Review blind applications, interview, and hire effortlessly.',
      icon: Users,
      iconColor: 'bg-emerald-100 text-emerald-600',
    },
  ];

  const steps = role === 'candidate' ? candidateSteps : recruiterSteps;

  return (
    <section id="how-it-works" className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Title on Left, Toggle on Right */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12">
          <div className="text-left mb-4 sm:mb-0">
            <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 font-normal tracking-tight mb-2">
              How It Works
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-normal">
              Getting started with your next opportunity is simple.
            </p>
          </div>

          {/* For Candidates | For Recruiters Toggle */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-full border border-slate-200 shadow-xs">
            <button
              onClick={() => setRole('candidate')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                role === 'candidate'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              For Candidates
            </button>
            <button
              onClick={() => setRole('recruiter')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                role === 'recruiter'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              For Recruiters
            </button>
          </div>
        </div>

        {/* 3 Steps Flow with Connector Arrows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative items-center">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="relative flex flex-col items-center text-center px-4">
                
                {/* Circle Icon Badge */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 shadow-xs ${step.iconColor}`}>
                  <Icon className="w-7 h-7" />
                </div>

                {/* Step Title */}
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="text-xs sm:text-sm text-slate-500 max-w-xs leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow connector between steps on desktop */}
                {idx < 2 && (
                  <div className="hidden md:flex absolute -right-4 top-8 text-slate-300">
                    <ChevronRight className="w-8 h-8 stroke-[1.5]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;

import React from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

const HeroSection = ({ onHireClick, onGetHiredClick }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
              <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-ping"></span>
              <span>100% Free Skill-Based Hiring Platform</span>
            </div>

            {/* Main Headline - Serif font matching reference image */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-normal text-slate-900 leading-[1.08] tracking-tight">
              Work Globally.<br />
              <span className="text-slate-900 font-serif">Locally.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-xl font-normal leading-relaxed">
              Unlock global opportunities and connect with top companies hiring across continents.
            </p>

            {/* CTAs matching the reference design */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onHireClick}
                className="px-7 py-3.5 rounded-full text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all hover:shadow-md transform active:scale-95"
              >
                Hire Independents
              </button>
              
              <button
                onClick={onGetHiredClick}
                className="px-7 py-3.5 rounded-full text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all hover:shadow hover:border-slate-300 transform active:scale-95"
              >
                Get Hired
              </button>
            </div>

            {/* Feature reassurance badges */}
            <div className="pt-4 flex items-center space-x-6 text-xs text-slate-500">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                <span>Zero Subscription Fees</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>Objective Blind Screening</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>Automated Resume Matching</span>
              </div>
            </div>
          </div>

          {/* Right Visual Floating Avatar Collage - Recreating reference screenshot */}
          <div className="lg:col-span-5 relative flex justify-center items-center py-6">
            
            {/* Subtle background glow */}
            <div className="absolute w-72 h-72 bg-brand-100/40 rounded-full blur-3xl -z-10"></div>
            
            <div className="relative w-full max-w-[380px] h-[380px]">
              
              {/* Top Avatar - Software Engineer (woman) */}
              <div className="absolute top-2 right-12 z-20 transition-transform duration-300 hover:scale-105">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"
                    alt="Software Engineer"
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-lift"
                  />
                  {/* Attached Chip Tag */}
                  <div className="absolute -bottom-2 -right-6 bg-white/95 backdrop-blur border border-slate-200 rounded-full px-3 py-1 shadow-sm flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                    <span className="text-[11px] font-semibold text-slate-800 whitespace-nowrap">Software Engineer</span>
                  </div>
                </div>
              </div>

              {/* Center/Bottom Large Avatar - Consultant (man) */}
              <div className="absolute bottom-6 left-6 z-10 transition-transform duration-300 hover:scale-105">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=260&auto=format&fit=crop&q=80"
                    alt="Consultant"
                    className="w-36 h-36 sm:w-44 sm:h-44 rounded-full object-cover border-4 border-white shadow-lift filter contrast-105"
                  />
                  {/* Status chip */}
                  <div className="absolute bottom-2 -left-3 bg-white/95 backdrop-blur border border-slate-200 rounded-full px-3 py-1 shadow-sm flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                    <span className="text-[11px] font-semibold text-slate-800">Consultant</span>
                  </div>
                </div>
              </div>

              {/* Right Avatar - Elle Smith / Top Freelancer */}
              <div className="absolute bottom-16 right-0 z-30 transition-transform duration-300 hover:scale-105">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                    alt="Elle Smith"
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-lift"
                  />
                  {/* Name & Badge */}
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur border border-slate-200 rounded-xl px-3 py-1 shadow-card text-center whitespace-nowrap">
                    <div className="text-xs font-bold text-slate-800">Elle Smith</div>
                    <div className="text-[10px] font-semibold text-brand-600">Top Freelancer</div>
                  </div>
                </div>
              </div>

              {/* Soft decorative dots */}
              <div className="absolute top-1/2 left-0 w-3 h-3 rounded-full bg-brand-300 animate-pulse"></div>
              <div className="absolute top-10 left-12 w-2 h-2 rounded-full bg-slate-300"></div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;

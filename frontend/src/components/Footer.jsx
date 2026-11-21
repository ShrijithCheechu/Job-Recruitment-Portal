import React from 'react';
import { Mail, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-12 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-100">
          
          {/* Brand Logo column */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <div className="flex items-baseline">
                <span className="text-xl font-bold tracking-tight text-slate-900">remotejob</span>
                <span className="text-xl font-extrabold text-brand-600">.io</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Empowering global talent through skill-based hiring, blind evaluation, and automated resume matching. 100% free for all.
            </p>
          </div>

          {/* About Column */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">About</h4>
            <ul className="space-y-2 text-xs font-medium text-slate-600">
              <li><a href="#" className="hover:text-brand-600 transition-colors">About us</a></li>
              <li><a href="#faq" className="hover:text-brand-600 transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Blogs</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Support</a></li>
            </ul>
          </div>

          {/* Trending Column */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Trending</h4>
            <ul className="space-y-2 text-xs font-medium text-slate-600">
              <li><a href="#featured" className="hover:text-brand-600 transition-colors">Web Development</a></li>
              <li><a href="#featured" className="hover:text-brand-600 transition-colors">Writing</a></li>
              <li><a href="#featured" className="hover:text-brand-600 transition-colors">Designer</a></li>
              <li><a href="#featured" className="hover:text-brand-600 transition-colors">Data Science</a></li>
            </ul>
          </div>

          {/* Connect With Us Column */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Connect With Us</h4>
            <div className="flex items-center space-x-3 text-slate-500">
              <a href="mailto:contact@remotejob.io" className="p-2 rounded-full hover:bg-slate-50 hover:text-brand-600 transition-colors" title="Email Us">
                <Mail className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full hover:bg-slate-50 hover:text-brand-600 transition-colors" title="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full hover:bg-slate-50 hover:text-brand-600 transition-colors" title="Twitter / X">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright line matching reference exact format */}
        <div className="pt-8 text-center text-xs text-slate-400">
          Copyright 2026 RemoteJob.io. All rights reserved
        </div>

      </div>
    </footer>
  );
};

export default Footer;

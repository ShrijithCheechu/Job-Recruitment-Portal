import React from 'react';
import { Gift } from 'lucide-react';

const FreeBanner = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 my-10">
      <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-2xl py-4 px-6 shadow-xs flex items-center justify-center space-x-3 text-center transition-transform hover:scale-[1.01]">
        <Gift className="w-6 h-6 text-emerald-600 flex-shrink-0 animate-bounce" />
        <span className="text-sm sm:text-base font-bold text-emerald-800 tracking-wide">
          100% Free to Use — No Subscription Plans
        </span>
      </div>
    </div>
  );
};

export default FreeBanner;

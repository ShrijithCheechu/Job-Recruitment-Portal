import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const DEFAULT_FAQS = [
  {
    id: 1,
    question: "How do I get started as a remote designer?",
    answer: "Sign up for a free candidate account, upload your portfolio link and PDF resume. Our automated skill parser will detect your design tools and match you with open design opportunities globally."
  },
  {
    id: 2,
    question: "What type of remote jobs are available?",
    answer: "We offer a wide range of remote opportunities across various industries including tech, marketing, design, customer support, and more. You can find both full-time positions and contract-based work."
  },
  {
    id: 3,
    question: "How can I make my profile stand out to employers?",
    answer: "Upload a clean text-based PDF resume so our skill extraction engine highlights your full technical repertoire. Achieving a 85%+ compatibility score for job postings significantly increases shortlist rates."
  },
  {
    id: 4,
    question: "How does the hiring process work?",
    answer: "Recruiters evaluate applicants using blind hiring, assessing skills, experience, and compatibility score free from unconscious bias. Once shortlisted, candidate identity is unlocked and live video interviews are scheduled."
  },
  {
    id: 5,
    question: "How do you verify remote candidates?",
    answer: "We verify remote candidates through automated resume extraction, past project portfolios, and structured interview workflows."
  },
  {
    id: 6,
    question: "Is RemoteJob.io really free?",
    answer: "Yes! RemoteJob.io is 100% free with no subscription plans, paid tiers, or hidden commissions for both candidates and recruiters."
  },
  {
    id: 7,
    question: "What support do you provide?",
    answer: "We offer complete community and technical support for interview coordination, resume parsing troubleshooting, and applicant pipeline management."
  }
];

const FAQSection = ({ faqs }) => {
  const faqList = (faqs && faqs.length > 0) ? faqs : DEFAULT_FAQS;
  const [openIdx, setOpenIdx] = useState(1); // Second item open by default matching reference screenshot!

  const toggleAccordion = (idx) => {
    setOpenIdx(openIdx === idx ? -1 : idx);
  };

  return (
    <section id="faq" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Title - Serif Heading */}
          <div className="lg:col-span-5 text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-slate-900 font-normal tracking-tight leading-tight">
              Frequently Asked<br />Questions
            </h2>
          </div>

          {/* Right Accordion List */}
          <div className="lg:col-span-7 space-y-3 text-left">
            {faqList.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={faq.id || idx}
                  className="border-b border-slate-200/80 pb-3"
                >
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full flex items-center justify-between py-3 text-left focus:outline-none group"
                  >
                    <span className="text-sm sm:text-base font-semibold text-slate-800 group-hover:text-brand-600 transition-colors">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-4 ${
                        isOpen ? 'rotate-180 text-brand-600' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="pt-1 pb-3 text-xs sm:text-sm text-slate-500 leading-relaxed font-normal animate-fade-in">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default FAQSection;

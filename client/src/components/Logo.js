import React from 'react';

export const Logo = ({ size = 'default', showTagline = false }) => {
    const isSmall = size === 'small';
    const isLarge = size === 'large';

    return (
        <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#087658] to-[#10b981] text-white shadow-md shadow-emerald-900/10 ${
                isSmall ? 'w-8 h-8' : isLarge ? 'w-12 h-12' : 'w-10 h-10'
            }`}>
                <svg
                    className={isSmall ? 'w-4 h-4' : isLarge ? 'w-7 h-7' : 'w-5 h-5'}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.2"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                </svg>
            </div>
            <div className="flex flex-col">
                <span className={`font-extrabold tracking-tight text-gray-900 ${
                    isSmall ? 'text-lg' : isLarge ? 'text-2xl' : 'text-xl'
                }`}>
                    Talent<span className="text-[#087658]">Track</span> <span className="text-xs uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-50 text-[#087658] font-bold border border-emerald-200">ATS</span>
                </span>
                {showTagline && (
                    <span className="text-xs text-gray-500 font-medium tracking-normal -mt-0.5">
                        Smart, Simple Hiring
                    </span>
                )}
            </div>
        </div>
    );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { BRANDING } from '../../config/branding';

export const Hero = () => {
    const isLoggedIn = !!localStorage.getItem('usertoken');

    return (
        <div className="relative bg-gradient-to-b from-emerald-50/60 via-white to-white py-12 md:py-20 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-7">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 text-[#087658] text-xs font-semibold mb-6">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                            {BRANDING.tagline}
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                            Streamline your hiring pipeline with{' '}
                            <span className="text-[#087658]">{BRANDING.appName}</span>
                        </h1>
                        <p className="mt-4 text-lg text-gray-600 max-w-2xl leading-relaxed">
                            A centralized, transparent applicant tracking platform. Post roles, organize candidates across stages, conduct structured screening, and leverage AI match scoring to find top talent fast.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-4 items-center">
                            <Link
                                to={isLoggedIn ? '/dash' : '/login'}
                                className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg text-sm font-semibold text-white bg-[#087658] hover:bg-[#065e46] shadow-sm transition-all"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Open ATS Dashboard
                            </Link>
                            <Link
                                to="/all-jobs"
                                className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all"
                            >
                                View Active Jobs
                            </Link>
                            <Link
                                to="/candidates"
                                className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-all"
                            >
                                Candidate Roster
                            </Link>
                        </div>

                        {/* STATS HIGHLIGHT */}
                        <div className="mt-12 grid grid-cols-3 gap-6 pt-8 border-t border-gray-200/80">
                            <div>
                                <p className="text-2xl font-bold text-gray-900">100%</p>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">Automated Pipeline</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-emerald-700">6 Stages</p>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">Structured Workflow</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">Python</p>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">Smart Match Scoring</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 hidden lg:block">
                        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 space-y-4">
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">Recruitment Overview</h3>
                                    <p className="text-xs text-gray-500">Live system status</p>
                                </div>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                    Active Pipeline
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 text-xs">
                                    <span className="font-medium text-gray-700">1. Applied & Screened</span>
                                    <span className="font-bold text-gray-900">New Resumes</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/60 text-xs text-emerald-900">
                                    <span className="font-medium">2. ATS Match Evaluation</span>
                                    <span className="font-bold">FastAPI Scorer</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 text-xs">
                                    <span className="font-medium text-gray-700">3. Interview & Assessment</span>
                                    <span className="font-bold text-gray-900">Recruiter Reviews</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 text-xs">
                                    <span className="font-medium text-gray-700">4. Offer & Hired</span>
                                    <span className="font-bold text-emerald-700">Final Stage</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

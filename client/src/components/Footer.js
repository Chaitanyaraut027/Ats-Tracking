import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { BRANDING } from '../config/branding';

export const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 mt-16">
            <div className="w-full max-w-screen-xl mx-auto p-6 md:py-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <Link to="/" className="flex items-center mb-4 sm:mb-0">
                        <Logo size="small" showTagline={true} />
                    </Link>
                    <ul className="flex flex-wrap justify-center items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 gap-6">
                        <li>
                            <Link to="/dash" className="hover:text-emerald-700 transition-colors">Dashboard</Link>
                        </li>
                        <li>
                            <Link to="/all-jobs" className="hover:text-emerald-700 transition-colors">Jobs</Link>
                        </li>
                        <li>
                            <Link to="/candidates" className="hover:text-emerald-700 transition-colors">Candidates</Link>
                        </li>
                        <li>
                            <Link to="/post-job" className="hover:text-emerald-700 transition-colors">Post Job</Link>
                        </li>
                    </ul>
                </div>
                <hr className="my-6 border-gray-200 sm:mx-auto" />
                <div className="sm:flex sm:items-center sm:justify-between text-xs text-gray-400">
                    <span>
                        © {BRANDING.copyrightYear} {BRANDING.appName}. {BRANDING.tagline}. All rights reserved.
                    </span>
                    <span className="mt-2 sm:mt-0">
                        Enterprise Applicant Tracking System
                    </span>
                </div>
            </div>
        </footer>
    );
};

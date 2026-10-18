import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import 'boxicons';

export const AllPostedJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setIsLoading(true);
                const data = await api.get('/jobs/all-jobs');
                setJobs(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching jobs:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const filteredJobs = jobs.filter((job) => {
        const term = searchTerm.toLowerCase();
        return (
            job.jobTitle?.toLowerCase().includes(term) ||
            job.location?.toLowerCase().includes(term) ||
            job.employmentType?.toLowerCase().includes(term)
        );
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Active Opportunities</h1>
                <p className="text-sm text-gray-600 mt-1">Browse open roles and submit your application</p>
                <div className="mt-4 max-w-md">
                    <input
                        type="text"
                        placeholder="Search by role, location, or type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087658] focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="border border-gray-100 rounded-xl p-6 bg-white animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-12 bg-gray-100 rounded mb-4"></div>
                        </div>
                    ))}
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-gray-600">No job openings found matching your query.</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.map((job) => (
                        <div
                            key={job._id || job.jobID}
                            className="flex flex-col justify-between bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                                        {job.employmentType || 'Full Time'}
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium">
                                        {job.salary ? `₹${job.salary} LPA` : 'Competitive'}
                                    </span>
                                </div>
                                <h2 className="font-bold text-lg text-gray-900 line-clamp-1">{job.jobTitle}</h2>
                                <p className="text-sm text-gray-600 line-clamp-3 mt-2 mb-4 leading-relaxed">
                                    {job.description}
                                </p>
                            </div>
                            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-xs text-gray-500 flex items-center">
                                    <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {job.location || 'Remote'}
                                </span>
                                <Link
                                    to={`/current-job/${job._id}`}
                                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#087658] hover:bg-[#065e46] text-white transition-colors"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
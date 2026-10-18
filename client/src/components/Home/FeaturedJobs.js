import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import 'boxicons';

export const FeaturedJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setIsLoading(true);
                const data = await api.get('/jobs/all-jobs');
                setJobs(Array.isArray(data) ? data : []);
                setError(null);
            } catch (err) {
                console.error('Error fetching jobs:', err);
                setError('Could not load jobs from server.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchJobs();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Featured Open Positions</h2>
                    <p className="text-sm text-gray-500 mt-1">Explore current recruitment postings and talent pipelines</p>
                </div>
                <Link
                    to="/all-posted-jobs"
                    className="inline-flex items-center text-sm font-semibold text-[#087658] hover:text-[#065e46]"
                >
                    View All Openings
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>

            {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="border border-gray-100 rounded-xl p-6 bg-white animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-12 bg-gray-100 rounded mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-gray-600 text-sm">{error}</p>
                    <p className="text-xs text-gray-400 mt-1">Make sure the Express backend server is running.</p>
                </div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-gray-600 font-medium">No job postings available yet.</p>
                    <Link to="/post-job" className="inline-block mt-3 text-sm font-semibold text-[#087658] hover:underline">
                        Create the first job posting
                    </Link>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.slice(0, 6).map((job) => (
                        <Card key={job._id || job.jobID} job={job} />
                    ))}
                </div>
            )}
        </div>
    );
};

function Card({ job }) {
    return (
        <div className="flex flex-col justify-between bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {job.employmentType || 'Full Time'}
                    </span>
                    <span className="text-xs font-medium text-gray-500">
                        {job.salary ? `₹${job.salary} LPA` : 'Competitive'}
                    </span>
                </div>
                <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{job.jobTitle}</h3>
                <p className="text-sm text-gray-600 line-clamp-3 mt-2 mb-4 leading-relaxed">
                    {job.description}
                </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-500">
                    <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{job.location || 'Remote'}</span>
                </div>
                <Link
                    to={`/current-job/${job._id}`}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#087658] hover:bg-[#065e46] text-white transition-colors"
                >
                    View & Apply
                </Link>
            </div>
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export const SimilarJobs = () => {
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await api.get('/jobs/all-jobs');
                if (Array.isArray(data)) {
                    setJobs(data.slice(0, 3));
                }
            } catch (err) {
                console.error('Error in SimilarJobs:', err);
            }
        };
        fetchJobs();
    }, []);

    if (jobs.length === 0) return null;

    return (
        <div className="pt-6 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Other Open Positions</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {jobs.map((job) => (
                    <div key={job._id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                        <div>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                                {job.employmentType}
                            </span>
                            <h3 className="font-bold text-gray-900 mt-2 line-clamp-1">{job.jobTitle}</h3>
                            <p className="text-xs text-gray-500 line-clamp-2 mt-1">{job.description}</p>
                        </div>
                        <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                            <span className="text-gray-500">{job.location}</span>
                            <Link to={`/current-job/${job._id}`} className="font-semibold text-[#087658] hover:underline">
                                View Role →
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
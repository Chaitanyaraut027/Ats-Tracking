import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

export const AllJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchJobs = async () => {
        try {
            setIsLoading(true);
            const data = await api.get('/jobs/all-jobs');
            setJobs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            toast.error('Failed to load job listings');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleDeleteJob = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete the job posting "${title}"?`)) {
            return;
        }
        try {
            await api.delete(`/jobs/delete-job/${id}`);
            toast.success('Job deleted successfully');
            setJobs((prev) => prev.filter((j) => j._id !== id));
        } catch (error) {
            console.error('Error deleting job:', error);
            toast.error(error.message || 'Unable to delete job');
        }
    };

    const filteredJobs = jobs.filter((job) => {
        const q = searchQuery.toLowerCase();
        return (
            job.jobTitle?.toLowerCase().includes(q) ||
            job.location?.toLowerCase().includes(q) ||
            job.employmentType?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Job Postings Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage active job openings, applicants, and screening workflows</p>
                </div>
                <Link
                    to="/post-job"
                    className="inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#087658] hover:bg-[#065e46] shadow-sm transition-colors"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Post New Job
                </Link>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="w-full sm:w-80">
                    <input
                        type="text"
                        placeholder="Search jobs by title or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087658] focus:border-transparent outline-none"
                    />
                </div>
                <div className="text-xs text-gray-500 font-medium">
                    Showing {filteredJobs.length} of {jobs.length} total jobs
                </div>
            </div>

            <div className="mt-6 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {isLoading ? (
                    <div className="p-8 text-center text-sm text-gray-500">Loading job postings...</div>
                ) : filteredJobs.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 font-medium">No job postings found.</p>
                        <Link to="/post-job" className="inline-block mt-2 text-sm font-semibold text-[#087658] hover:underline">
                            Create your first job posting
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Job Title</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Compensation</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Applicants</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {filteredJobs.map((job) => (
                                    <tr key={job._id || job.jobID} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-semibold text-sm text-gray-900">{job.jobTitle}</div>
                                            <div className="text-xs text-gray-400 font-mono mt-0.5">ID: {job.jobID || job._id?.slice(-6)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                                                {job.employmentType || 'Full Time'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {job.location || 'Remote'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {job.salary ? `₹${job.salary} LPA` : '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <span className="font-semibold text-gray-900">{job.applicants?.length || 0}</span> candidates
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <Link
                                                to={`/current-job/${job._id}`}
                                                className="text-xs px-2.5 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors inline-block"
                                            >
                                                View
                                            </Link>
                                            <Link
                                                to={`/update-job/${job._id}`}
                                                className="text-xs px-2.5 py-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors inline-block"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteJob(job._id, job.jobTitle)}
                                                className="text-xs px-2.5 py-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 transition-colors inline-block"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
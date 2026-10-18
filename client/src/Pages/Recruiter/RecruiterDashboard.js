import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export const RecruiterDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const loadPipeline = async () => {
            try {
                setIsLoading(true);
                const [jobsData, usersData] = await Promise.all([
                    api.get('/jobs/all-jobs').catch(() => []),
                    api.get('/users/all-users').catch(() => []),
                ]);

                const jobList = Array.isArray(jobsData) ? jobsData : [];
                const userList = Array.isArray(usersData) ? usersData : [];

                setJobs(jobList);
                if (jobList.length > 0) {
                    const first = jobList[0];
                    setSelectedJob(first);
                    if (first.applicants && first.applicants.length > 0) {
                        const matched = userList.filter((u) =>
                            first.applicants.some((a) => a.applicant === u._id)
                        );
                        setApplicants(matched);
                    } else {
                        // If job has no applicants, also show candidates from database for screening
                        const candidateUsers = userList.filter((u) => u.role === 'candidate');
                        setApplicants(candidateUsers);
                    }
                }
            } catch (err) {
                console.error('Error loading recruiter pipeline:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadPipeline();
    }, []);

    const handleSelectJob = (jobId) => {
        const chosen = jobs.find((j) => j._id === jobId);
        setSelectedJob(chosen);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Recruiter Screening Pipeline</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Evaluate candidate applications, conduct structured reviews, and calculate ATS match scores
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-semibold uppercase">Active Job:</span>
                    <select
                        value={selectedJob?._id || ''}
                        onChange={(e) => handleSelectJob(e.target.value)}
                        className="px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-[#087658]"
                    >
                        {jobs.map((j) => (
                            <option key={j._id} value={j._id}>
                                {j.jobTitle}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedJob && (
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                            {selectedJob.employmentType}
                        </span>
                        <h2 className="text-lg font-bold text-gray-900 mt-1">{selectedJob.jobTitle}</h2>
                        <p className="text-xs text-gray-600">Location: {selectedJob.location} • Compensation: ₹{selectedJob.salary} LPA</p>
                    </div>
                    <Link
                        to={`/current-job/${selectedJob._id}`}
                        className="text-xs font-semibold text-[#087658] hover:underline"
                    >
                        View Full Job Posting →
                    </Link>
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-900">Candidates Awaiting Screening ({applicants.length})</h2>
                    <Link to="/candidates" className="text-xs font-semibold text-[#087658] hover:underline">
                        View All Registered Candidates
                    </Link>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center text-sm text-gray-500">Loading applicants for screening...</div>
                ) : applicants.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 font-medium">No candidate applications currently pending for this position.</p>
                        <Link to="/candidates" className="mt-2 inline-block text-xs font-semibold text-[#087658] hover:underline">
                            Browse candidate roster →
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate Name</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Stage</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {applicants.map((cand) => (
                                    <tr key={cand._id} className="hover:bg-gray-50/70 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-semibold text-sm text-gray-900">{cand.userName}</div>
                                            <div className="text-xs text-gray-400">{cand.address || 'Remote'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {cand.userEmail}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                                                {cand.currentStage || 'Screening'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium space-x-2">
                                            <Link
                                                to={`/candidate/${cand._id}`}
                                                className="px-3 py-1.5 rounded-lg bg-[#087658] text-white font-semibold hover:bg-[#065e46] transition-colors inline-block"
                                            >
                                                Screen & Evaluate →
                                            </Link>
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
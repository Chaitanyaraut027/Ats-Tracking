import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const STAGE_BADGES = {
    Applied: 'bg-blue-50 text-blue-700 border-blue-200',
    Screening: 'bg-purple-50 text-purple-700 border-purple-200',
    Interview: 'bg-amber-50 text-amber-700 border-amber-200',
    Assessment: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Offer: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Hired: 'bg-green-50 text-green-700 border-green-200',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const MyJobs = () => {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const candidateId = currentUser._id || currentUser.id;

    useEffect(() => {
        const fetchMyApplications = async () => {
            try {
                setIsLoading(true);
                const [allApps, allJobs] = await Promise.all([
                    api.get('/application/all-application/').catch(() => []),
                    api.get('/jobs/all-jobs').catch(() => []),
                ]);

                const apps = Array.isArray(allApps) ? allApps : [];
                const jobs = Array.isArray(allJobs) ? allJobs : [];

                // Filter for current user's applications
                const myApps = apps.filter((a) => a.candidateID === candidateId);

                // Match with job details
                const enriched = myApps.map((a) => {
                    const job = jobs.find((j) => j._id === a.jobID);
                    return {
                        _id: a._id,
                        status: a.applicationStatus || 'Applied',
                        matchScore: a.matchScore,
                        createdAt: a.createdAt,
                        jobTitle: job ? job.jobTitle : 'Position Application',
                        employmentType: job ? job.employmentType : 'Full Time',
                        location: job ? job.location : 'Remote',
                        salary: job ? job.salary : null,
                        jobId: a.jobID,
                    };
                });

                setApplications(enriched);
            } catch (err) {
                console.error('Error fetching applications:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyApplications();
    }, [candidateId]);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Job Applications</h1>
                    <p className="text-sm text-gray-500 mt-1">Track your active submissions and recruitment milestones</p>
                </div>
                <Link
                    to="/all-posted-jobs"
                    className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-[#087658] hover:bg-[#065e46] rounded-lg shadow-sm"
                >
                    Browse More Openings
                </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {isLoading ? (
                    <div className="p-12 text-center text-sm text-gray-500">Loading your applications...</div>
                ) : applications.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 font-medium">You haven't submitted any job applications yet.</p>
                        <Link to="/all-posted-jobs" className="mt-2 inline-block text-xs font-semibold text-[#087658] hover:underline">
                            Explore available positions →
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {applications.map((app) => (
                                    <tr key={app._id} className="hover:bg-gray-50/70 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-semibold text-sm text-gray-900">{app.jobTitle}</div>
                                            {app.salary && <div className="text-xs text-gray-400">₹{app.salary} LPA</div>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {app.employmentType}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {app.location}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${STAGE_BADGES[app.status] || 'bg-gray-50 text-gray-700'}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                                            <Link
                                                to={`/current-job/${app.jobId}`}
                                                className="text-[#087658] hover:underline font-semibold"
                                            >
                                                View Role
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
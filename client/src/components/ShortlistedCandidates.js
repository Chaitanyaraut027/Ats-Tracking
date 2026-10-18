import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export const ShortlistedCandidates = () => {
    const [candidates, setCandidates] = useState([]);
    const [applications, setApplications] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadShortlistedData = async () => {
            try {
                setIsLoading(true);
                const [allApps, allUsers, allJobs] = await Promise.all([
                    api.get('/application/all-application/').catch(() => []),
                    api.get('/users/all-users').catch(() => []),
                    api.get('/jobs/all-jobs').catch(() => []),
                ]);

                const apps = Array.isArray(allApps) ? allApps : [];
                const users = Array.isArray(allUsers) ? allUsers : [];
                const jobList = Array.isArray(allJobs) ? allJobs : [];

                setJobs(jobList);
                setApplications(apps);

                // Filter shortlisted applications
                const shortlistedApps = apps.filter(
                    (a) =>
                        a.applicationStatus?.toLowerCase() === 'shortlist' ||
                        a.applicationStatus?.toLowerCase() === 'shortlisted' ||
                        a.applicationStatus === 'Interview' ||
                        a.applicationStatus === 'Offer' ||
                        a.applicationStatus === 'Hired'
                );

                // Match with candidate users
                const shortlistedUsers = users.filter((u) =>
                    shortlistedApps.some((a) => a.candidateID === u._id)
                );

                setCandidates(shortlistedUsers);
            } catch (err) {
                console.error('Error loading shortlisted candidates:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadShortlistedData();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="pb-6 border-b border-gray-200">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    Shortlisted Talent Pipeline
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Candidates who have passed initial screening and are qualified for subsequent rounds
                </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {isLoading ? (
                    <div className="p-12 text-center text-sm text-gray-500">Loading shortlisted candidates...</div>
                ) : candidates.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 font-medium">No shortlisted candidates found at this time.</p>
                        <Link to="/candidates" className="mt-2 inline-block text-xs font-semibold text-[#087658] hover:underline">
                            Review candidate roster →
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stage</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {candidates.map((cand) => {
                                    const app = applications.find((a) => a.candidateID === cand._id);
                                    const targetJob = jobs.find((j) => j._id === app?.jobID) || jobs[0];

                                    return (
                                        <tr key={cand._id} className="hover:bg-gray-50/70 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-sm text-gray-900">{cand.userName}</div>
                                                <div className="text-xs text-gray-400">{cand.address || 'Remote'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {cand.userEmail}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                    {cand.currentStage || app?.applicationStatus || 'Shortlisted'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium space-x-2">
                                                <Link
                                                    to={`/candidate/${cand._id}`}
                                                    className="px-3 py-1.5 rounded-lg bg-[#087658] text-white font-semibold hover:bg-[#065e46] transition-colors inline-block"
                                                >
                                                    Evaluate & Score
                                                </Link>
                                                {targetJob && (
                                                    <Link
                                                        to={`/shortlist/details/${cand._id}/${targetJob._id}`}
                                                        className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors inline-block"
                                                    >
                                                        Details
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
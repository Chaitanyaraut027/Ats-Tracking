import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export const CoordinatorDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [recruiters, setRecruiters] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadCoordinatorData = async () => {
            try {
                setIsLoading(true);
                const [jobsData, usersData, recruitersData] = await Promise.all([
                    api.get('/jobs/all-jobs').catch(() => []),
                    api.get('/users/all-users').catch(() => []),
                    api.get('/recruiter/all-recruiter').catch(() => []),
                ]);

                setJobs(Array.isArray(jobsData) ? jobsData : []);
                setAssignments(Array.isArray(recruitersData) ? recruitersData : []);

                if (Array.isArray(usersData)) {
                    setRecruiters(usersData.filter((u) => u.role === 'recruiter'));
                }
            } catch (err) {
                console.error('Coordinator load error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadCoordinatorData();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Coordinator Recruitment Workflow</h1>
                    <p className="text-sm text-gray-500 mt-1">Approve job requisitions and allocate screening recruiters</p>
                </div>
                <Link
                    to="/post-job"
                    className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-[#087658] hover:bg-[#065e46] rounded-lg shadow-sm"
                >
                    + Post New Job
                </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {isLoading ? (
                    <div className="p-12 text-center text-sm text-gray-500">Loading requisitions...</div>
                ) : jobs.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 font-medium">No job postings awaiting coordinator review.</p>
                        <Link to="/post-job" className="mt-2 inline-block text-xs font-semibold text-[#087658] hover:underline">
                            Create a job posting →
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
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Recruiter</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {jobs.map((job) => {
                                    const assignment = assignments.find((a) => a.jobID === job._id || a.jobID === job.jobID);
                                    const assignedRecruiter = recruiters.find((r) => r._id === assignment?.recruiterID);

                                    return (
                                        <tr key={job._id} className="hover:bg-gray-50/70 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-sm text-gray-900">{job.jobTitle}</div>
                                                <div className="text-xs text-gray-400 font-mono">ID: {job.jobID || job._id?.slice(-6)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {job.employmentType}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {job.location}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {assignedRecruiter ? (
                                                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                                        ✓ {assignedRecruiter.userName}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                        Pending Assignment
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                                                <Link
                                                    to={`/assign-recruiter/${job._id}`}
                                                    className="px-3 py-1.5 rounded-lg bg-[#087658] text-white font-semibold hover:bg-[#065e46] transition-colors inline-block"
                                                >
                                                    {assignedRecruiter ? 'Reassign' : 'Approve & Assign'}
                                                </Link>
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
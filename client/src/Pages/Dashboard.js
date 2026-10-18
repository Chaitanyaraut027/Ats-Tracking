import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const STAGE_COLORS = {
    Applied: 'bg-blue-100 text-blue-800 border-blue-200',
    Screening: 'bg-purple-100 text-purple-800 border-purple-200',
    Interview: 'bg-amber-100 text-amber-800 border-amber-200',
    Assessment: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    Offer: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Hired: 'bg-green-100 text-green-800 border-green-200',
    Rejected: 'bg-rose-100 text-rose-800 border-rose-200',
};

export const Dashboard = () => {
    const [metrics, setMetrics] = useState({
        totalCandidates: 0,
        totalJobs: 0,
        totalApplications: 0,
        stageCounts: {
            Applied: 0,
            Screening: 0,
            Interview: 0,
            Assessment: 0,
            Offer: 0,
            Hired: 0,
            Rejected: 0,
        },
        recentCandidates: [],
        recentApplications: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMetrics = async () => {
        try {
            setIsLoading(true);
            const data = await api.get('/api/dashboard/metrics');
            if (data.success) {
                setMetrics(data);
                setError(null);
            }
        } catch (err) {
            console.error('Failed to load dashboard metrics:', err);
            setError('Could not connect to the ATS backend service.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
    }, []);

    const stageList = [
        { name: 'Applied', count: metrics.stageCounts?.Applied || 0, color: 'bg-blue-500' },
        { name: 'Screening', count: metrics.stageCounts?.Screening || 0, color: 'bg-purple-500' },
        { name: 'Interview', count: metrics.stageCounts?.Interview || 0, color: 'bg-amber-500' },
        { name: 'Assessment', count: metrics.stageCounts?.Assessment || 0, color: 'bg-indigo-500' },
        { name: 'Offer', count: metrics.stageCounts?.Offer || 0, color: 'bg-emerald-500' },
        { name: 'Hired', count: metrics.stageCounts?.Hired || 0, color: 'bg-green-600' },
        { name: 'Rejected', count: metrics.stageCounts?.Rejected || 0, color: 'bg-red-400' },
    ];

    const maxStageCount = Math.max(...stageList.map((s) => s.count), 1);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* DASHBOARD HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                        TalentTrack ATS Command Center
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Real-time overview of candidate applications, hiring stages, and open roles
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link
                        to="/post-job"
                        className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg text-white bg-[#087658] hover:bg-[#065e46] shadow-sm transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Post New Job
                    </Link>
                    <Link
                        to="/candidates"
                        className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                        Candidate Roster
                    </Link>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center justify-between">
                    <span>{error} Showing offline interface.</span>
                    <button onClick={fetchMetrics} className="underline text-xs font-bold">Retry</button>
                </div>
            )}

            {/* KPI STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Candidates</span>
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                            👥
                        </div>
                    </div>
                    <p className="text-3xl font-black text-gray-900 mt-3">{isLoading ? '...' : metrics.totalCandidates}</p>
                    <span className="text-xs text-gray-500 mt-1 inline-block">Registered applicant pool</span>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Active Jobs</span>
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#087658] flex items-center justify-center font-bold text-sm">
                            💼
                        </div>
                    </div>
                    <p className="text-3xl font-black text-gray-900 mt-3">{isLoading ? '...' : metrics.totalJobs}</p>
                    <span className="text-xs text-gray-500 mt-1 inline-block">Current open requisitions</span>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Applications</span>
                        <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
                            📄
                        </div>
                    </div>
                    <p className="text-3xl font-black text-gray-900 mt-3">{isLoading ? '...' : metrics.totalApplications}</p>
                    <span className="text-xs text-gray-500 mt-1 inline-block">Submissions across all jobs</span>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">In Screening / Review</span>
                        <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                            ⚡
                        </div>
                    </div>
                    <p className="text-3xl font-black text-gray-900 mt-3">
                        {isLoading ? '...' : (metrics.stageCounts?.Screening || 0) + (metrics.stageCounts?.Interview || 0)}
                    </p>
                    <span className="text-xs text-gray-500 mt-1 inline-block">Active recruitment pipeline</span>
                </div>
            </div>

            {/* RECRUITMENT PIPELINE STAGES BREAKDOWN */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Pipeline Stage Distribution</h2>
                        <p className="text-xs text-gray-500">Live progress across standard recruitment hiring stages</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-100">
                        7 Configured Stages
                    </span>
                </div>

                <div className="space-y-4">
                    {stageList.map((stage) => {
                        const pct = Math.round((stage.count / maxStageCount) * 100);
                        return (
                            <div key={stage.name} className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs font-medium">
                                    <span className="text-gray-700 font-semibold">{stage.name}</span>
                                    <span className="text-gray-900 font-bold">{stage.count} candidate{stage.count === 1 ? '' : 's'}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className={`h-2.5 rounded-full ${stage.color} transition-all duration-500`}
                                        style={{ width: `${Math.max(pct, stage.count > 0 ? 5 : 0)}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* RECENT ACTIVITY & SUBMISSIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* RECENT APPLICATIONS */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                        <h2 className="text-base font-bold text-gray-900">Recent Applications</h2>
                        <Link to="/candidates" className="text-xs font-semibold text-[#087658] hover:underline">
                            View All
                        </Link>
                    </div>

                    {isLoading ? (
                        <p className="text-xs text-gray-400 py-4">Loading applications...</p>
                    ) : metrics.recentApplications?.length === 0 ? (
                        <p className="text-xs text-gray-400 py-6 text-center">No applications recorded yet.</p>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {metrics.recentApplications.map((app) => (
                                <div key={app._id} className="py-3 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{app.candidateName}</p>
                                        <p className="text-xs text-gray-500">{app.jobTitle}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {app.matchScore !== undefined && (
                                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                {app.matchScore}% Match
                                            </span>
                                        )}
                                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STAGE_COLORS[app.status] || 'bg-gray-100 text-gray-800'}`}>
                                            {app.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* RECENT CANDIDATES */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                        <h2 className="text-base font-bold text-gray-900">Recent Candidates</h2>
                        <Link to="/candidates" className="text-xs font-semibold text-[#087658] hover:underline">
                            Manage Candidates
                        </Link>
                    </div>

                    {isLoading ? (
                        <p className="text-xs text-gray-400 py-4">Loading candidates...</p>
                    ) : metrics.recentCandidates?.length === 0 ? (
                        <p className="text-xs text-gray-400 py-6 text-center">No registered candidates yet.</p>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {metrics.recentCandidates.map((c) => (
                                <div key={c._id} className="py-3 flex items-center justify-between gap-3">
                                    <div>
                                        <Link to={`/candidate/${c._id}`} className="text-sm font-semibold text-gray-900 hover:text-[#087658]">
                                            {c.userName}
                                        </Link>
                                        <p className="text-xs text-gray-500">{c.userEmail}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STAGE_COLORS[c.currentStage] || 'bg-gray-100 text-gray-800'}`}>
                                            {c.currentStage || 'Applied'}
                                        </span>
                                        <Link
                                            to={`/candidate/${c._id}`}
                                            className="block text-[11px] text-[#087658] hover:underline mt-1 font-medium"
                                        >
                                            Evaluate →
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

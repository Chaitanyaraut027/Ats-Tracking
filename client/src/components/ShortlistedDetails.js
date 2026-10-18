import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';

export const ShortlistedDetails = () => {
    const { candidate_id, job_id } = useParams();
    const [candidate, setCandidate] = useState(null);
    const [job, setJob] = useState(null);
    const [application, setApplication] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDetails = async () => {
            try {
                setIsLoading(true);
                const [cand, j, apps] = await Promise.all([
                    api.get(`/users/user/${candidate_id}`).catch(() => null),
                    api.get(`/jobs/current-job/${job_id}`).catch(() => null),
                    api.get('/application/all-application/').catch(() => []),
                ]);

                setCandidate(cand);
                setJob(j);

                if (Array.isArray(apps)) {
                    const matchedApp = apps.find((a) => a.candidateID === candidate_id && a.jobID === job_id)
                        || apps.find((a) => a.candidateID === candidate_id);
                    setApplication(matchedApp);
                }
            } catch (err) {
                console.error('Error loading shortlisted details:', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (candidate_id && job_id) {
            loadDetails();
        }
    }, [candidate_id, job_id]);

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center text-sm text-gray-500">
                Loading shortlisted applicant file...
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Shortlisted Candidate Summary</h1>
                    <p className="text-sm text-gray-500 mt-1">Cross-referencing candidate application and role requirements</p>
                </div>
                <Link
                    to="/shortlist"
                    className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    ← Back to Shortlist
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CANDIDATE PROFILE */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 pb-2 border-b border-gray-100">
                        Candidate Information
                    </h2>
                    {candidate ? (
                        <div className="space-y-2 text-sm">
                            <p className="text-lg font-bold text-gray-900">{candidate.userName}</p>
                            <p className="text-gray-600"><span className="font-semibold text-gray-700">Email:</span> {candidate.userEmail}</p>
                            <p className="text-gray-600"><span className="font-semibold text-gray-700">Gender:</span> {candidate.gender || 'Not specified'}</p>
                            <p className="text-gray-600"><span className="font-semibold text-gray-700">Location:</span> {candidate.address || 'Not specified'}</p>
                            <div className="pt-3">
                                <Link
                                    to={`/candidate/${candidate._id}`}
                                    className="inline-block text-xs font-semibold text-[#087658] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100"
                                >
                                    Open Full Profile & ATS Match Score →
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400">Candidate data unavailable.</p>
                    )}
                </div>

                {/* JOB INFO */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 pb-2 border-b border-gray-100">
                        Target Role Information
                    </h2>
                    {job ? (
                        <div className="space-y-2 text-sm">
                            <p className="text-lg font-bold text-gray-900">{job.jobTitle}</p>
                            <p className="text-gray-600"><span className="font-semibold text-gray-700">Type:</span> {job.employmentType}</p>
                            <p className="text-gray-600"><span className="font-semibold text-gray-700">Location:</span> {job.location}</p>
                            <p className="text-gray-600"><span className="font-semibold text-gray-700">Compensation:</span> ₹{job.salary} LPA</p>
                            <p className="text-xs text-gray-500 line-clamp-3 mt-2 leading-relaxed">{job.description}</p>
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400">Job posting unavailable.</p>
                    )}
                </div>
            </div>

            {/* FEEDBACK & SCREENING FORM RESPONSES */}
            {application && application.candidateFeedback && application.candidateFeedback.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 pb-2 border-b border-gray-100">
                        Recruiter Feedback & Screening Form Checks
                    </h2>
                    <div className="divide-y divide-gray-100">
                        {application.candidateFeedback.map((fb, idx) => (
                            <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                                <span className="font-medium text-gray-700">{fb.question}</span>
                                <span className="font-bold text-gray-900 px-2 py-0.5 rounded bg-gray-100">
                                    {fb.answer}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

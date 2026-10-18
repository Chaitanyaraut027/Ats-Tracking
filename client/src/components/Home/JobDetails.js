import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { SimilarJobs } from '../SimilarJobs';

export const JobDetails = () => {
    const { id } = useParams();

    const [job, setJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [resumeFile, setResumeFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const candidateId = currentUser._id || currentUser.id;

    useEffect(() => {
        const fetchJobData = async () => {
            try {
                setIsLoading(true);
                const jobData = await api.get(`/jobs/current-job/${id}`);
                setJob(jobData);

                // Fetch applicants if any
                if (jobData && jobData.applicants && jobData.applicants.length > 0) {
                    try {
                        const users = await api.get('/users/all-users');
                        if (Array.isArray(users)) {
                            const matched = users.filter((u) =>
                                jobData.applicants.some((a) => a.applicant === u._id)
                            );
                            setApplicants(matched);
                        }
                    } catch (e) {}
                }
            } catch (err) {
                console.error('Error fetching job:', err);
                toast.error('Failed to load job posting');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchJobData();
    }, [id]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setResumeFile(file);

        if (!candidateId) {
            toast.info('Resume selected. Please sign in or register to complete submission.');
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            await api.upload(`/upload/resume/${candidateId}`, formData);
            toast.success('Resume file attached successfully');
        } catch (err) {
            console.error('Upload error:', err);
            toast.error('Failed to upload resume file');
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center text-sm text-gray-500">
                Loading role specifications...
            </div>
        );
    }

    if (!job) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <p className="text-gray-600 font-semibold">Job posting not found</p>
                <Link to="/all-jobs" className="mt-3 inline-block text-sm text-[#087658] font-semibold hover:underline">
                    ← Return to all jobs
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                {/* ROLE HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                                {job.employmentType || 'Full Time'}
                            </span>
                            <span className="text-xs text-gray-500">
                                TalentTrack ATS • ID: {job.jobID || job._id?.slice(-6)}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">{job.jobTitle}</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            📍 {job.location || 'Remote'} • Compensation: ₹{job.salary} LPA
                        </p>
                    </div>

                    <Link
                        to={`/application-form/${job._id}`}
                        className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold text-white bg-[#087658] hover:bg-[#065e46] shadow-sm transition-all"
                    >
                        Apply for this Role →
                    </Link>
                </div>

                {/* ROLE HIGHLIGHTS GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="text-xs text-gray-500 block uppercase font-semibold">Employment</span>
                        <p className="text-base font-bold text-gray-900 mt-1">{job.employmentType}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="text-xs text-gray-500 block uppercase font-semibold">Compensation</span>
                        <p className="text-base font-bold text-gray-900 mt-1">₹{job.salary} LPA</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="text-xs text-gray-500 block uppercase font-semibold">Location</span>
                        <p className="text-base font-bold text-gray-900 mt-1">{job.location}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="text-xs text-gray-500 block uppercase font-semibold">Total Applicants</span>
                        <p className="text-base font-bold text-gray-900 mt-1">{job.applicants?.length || 0}</p>
                    </div>
                </div>

                {/* JOB DESCRIPTION */}
                <div className="space-y-3 pt-2">
                    <h2 className="text-lg font-bold text-gray-900">Job Description & Responsibilities</h2>
                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                        {job.description}
                    </p>
                </div>

                {/* SCREENING QUESTIONS CHECKLIST */}
                {job.applicationForm?.question && job.applicationForm.question.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                            Required Screening Checkpoints
                        </h2>
                        <ul className="space-y-2">
                            {job.applicationForm.question.map((q, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-[#087658] flex items-center justify-center font-bold text-[10px]">✓</span>
                                    {q}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* RESUME UPLOAD & APPLICATION ACTION */}
                <div className="pt-6 border-t border-gray-100 bg-emerald-50/40 p-6 rounded-xl border border-emerald-100 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-base font-bold text-gray-900">Ready to submit your application?</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Attach your resume file or complete the online candidate screening form</p>
                        </div>
                        <Link
                            to={`/application-form/${job._id}`}
                            className="inline-flex items-center px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#087658] hover:bg-[#065e46] shadow-sm transition-all"
                        >
                            Open Application Form
                        </Link>
                    </div>

                    <div className="max-w-md">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Quick Resume Attachment (PDF / TXT):
                        </label>
                        <input
                            type="file"
                            accept=".pdf,.txt,.doc,.docx"
                            onChange={handleFileUpload}
                            className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-white file:text-[#087658] file:border file:border-emerald-200 cursor-pointer"
                        />
                        {resumeFile && (
                            <p className="text-xs text-emerald-800 font-medium mt-1">
                                Selected: {resumeFile.name} {isUploading && '(uploading...)'}
                            </p>
                        )}
                    </div>
                </div>

                {/* CANDIDATES LISTED UNDER THIS JOB (FOR RECRUITERS) */}
                {applicants.length > 0 && (
                    <div className="pt-6 border-t border-gray-100 space-y-3">
                        <h2 className="text-base font-bold text-gray-900">Active Candidates Applied to this Role</h2>
                        <div className="divide-y divide-gray-100">
                            {applicants.map((cand) => (
                                <div key={cand._id} className="py-2.5 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{cand.userName}</p>
                                        <p className="text-xs text-gray-500">{cand.userEmail}</p>
                                    </div>
                                    <Link
                                        to={`/candidate/${cand._id}`}
                                        className="text-xs font-semibold text-[#087658] hover:underline"
                                    >
                                        Evaluate Candidate Profile & ATS Score →
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <SimilarJobs />
        </div>
    );
};

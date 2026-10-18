import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../../services/api';

export const ApplicationForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);

    // Get current logged-in candidate
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const candidateId = currentUser._id || currentUser.id;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            applicantName: currentUser.userName || '',
            applicantEmail: currentUser.userEmail || '',
            resumeText: '',
            screeningAnswers: {},
        },
    });

    useEffect(() => {
        const fetchJob = async () => {
            try {
                setIsLoading(true);
                const data = await api.get(`/jobs/current-job/${id}`);
                setJob(data);
            } catch (err) {
                console.error('Error fetching job details:', err);
                toast.error('Unable to load job details');
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchJob();
    }, [id]);

    const onSubmit = async (formData) => {
        if (!candidateId) {
            toast.warning('Please log in or register as a Candidate to submit an application');
            navigate('/login');
            return;
        }

        try {
            setIsSubmitting(true);

            // Handle resume file upload if provided
            if (resumeFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', resumeFile);
                try {
                    await api.upload(`/upload/resume/${candidateId}`, uploadFormData);
                } catch (uploadErr) {
                    console.warn('Resume file upload warning:', uploadErr);
                }
            }

            // Build screening questions array
            const questions = job?.applicationForm?.question || [];
            const applicationFormPayload = questions.map((q, idx) => ({
                question: q,
                answer: formData[`question_${idx}`] || 'Yes',
            }));

            // Submit application
            const payload = {
                jobID: id,
                candidateID: candidateId,
                applicationStatus: 'Applied',
                applicationForm: applicationFormPayload,
                candidateFeedback: [],
            };

            await api.post('/application/post-application', payload);

            // Update candidate skills/resumeText if provided
            if (formData.resumeText) {
                try {
                    await api.put(`/api/candidates/${candidateId}`, {
                        resumeText: formData.resumeText,
                    });
                } catch (e) {}
            }

            toast.success('Your application was submitted successfully!');
            navigate('/my-jobs');
        } catch (error) {
            console.error('Application submit error:', error);
            toast.error(error.message || 'Failed to submit application');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center text-sm text-gray-500">
                Loading job application...
            </div>
        );
    }

    if (!job) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <p className="text-gray-600 font-semibold">Job posting not found.</p>
                <Link to="/all-posted-jobs" className="mt-3 inline-block text-sm text-[#087658] font-bold">
                    ← Browse Open Positions
                </Link>
            </div>
        );
    }

    const screeningQuestions = job.applicationForm?.question || [];

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Apply for {job.jobTitle}</h1>
                <p className="text-sm text-gray-500 mt-1">
                    {job.employmentType} • {job.location} • Compensation: ₹{job.salary} LPA
                </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* CANDIDATE INFO */}
                    <div className="space-y-4">
                        <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100">
                            1. Applicant Information
                        </h2>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                required
                                {...register('applicantName', { required: true })}
                                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087658] outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                required
                                {...register('applicantEmail', { required: true })}
                                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087658] outline-none"
                            />
                        </div>
                    </div>

                    {/* RESUME ATTACHMENT / TEXT */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100">
                            2. Resume & Qualifications
                        </h2>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                                Upload Resume (PDF or TXT)
                            </label>
                            <input
                                type="file"
                                accept=".pdf,.txt,.doc,.docx"
                                onChange={(e) => setResumeFile(e.target.files[0])}
                                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-[#087658] hover:file:bg-emerald-100 cursor-pointer"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                                Or Paste Resume / Skills Summary:
                            </label>
                            <textarea
                                rows={4}
                                {...register('resumeText')}
                                placeholder="Summary of technical skills, experience, and past roles..."
                                className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087658] outline-none"
                            />
                        </div>
                    </div>

                    {/* SCREENING QUESTIONS */}
                    {screeningQuestions.length > 0 && (
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100">
                                3. Qualification Checkpoints
                            </h2>

                            <div className="space-y-3">
                                {screeningQuestions.map((question, index) => (
                                    <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-1.5">
                                        <p className="text-xs font-semibold text-gray-800">
                                            {index + 1}. {question}
                                        </p>
                                        <div className="flex items-center gap-6 text-xs text-gray-600">
                                            <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value="Yes"
                                                    defaultChecked
                                                    {...register(`question_${index}`)}
                                                />
                                                <span>Yes</span>
                                            </label>
                                            <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value="No"
                                                    {...register(`question_${index}`)}
                                                />
                                                <span>No</span>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                        <Link to={`/current-job/${id}`} className="text-xs text-gray-500 hover:underline">
                            ← Cancel and return to job
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#087658] hover:bg-[#065e46] rounded-lg shadow-sm disabled:opacity-50"
                        >
                            {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

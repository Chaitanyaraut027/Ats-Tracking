import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

export const AssignRecruiter = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [recruiters, setRecruiters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [questions, setQuestions] = useState([
        'Willing to relocate?',
        'Sufficient technical experience for the role?',
        'Notice period within 30 days?',
    ]);

    const { register, handleSubmit } = useForm({
        defaultValues: {
            recruiterID: '',
        },
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const [jobData, users] = await Promise.all([
                    api.get(`/jobs/current-job/${id}`).catch(() => null),
                    api.get('/users/all-users').catch(() => []),
                ]);

                setJob(jobData);
                if (Array.isArray(users)) {
                    const availableRecruiters = users.filter((u) => u.role === 'recruiter');
                    setRecruiters(availableRecruiters);
                }
            } catch (err) {
                console.error('Error in AssignRecruiter:', err);
                toast.error('Failed to load job and recruiter data');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) loadData();
    }, [id]);

    const addQuestion = (e) => {
        e.preventDefault();
        setQuestions([...questions, '']);
    };

    const handleQuestionChange = (index, value) => {
        const updated = [...questions];
        updated[index] = value;
        setQuestions(updated);
    };

    const removeQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const onSubmit = async (data) => {
        if (!data.recruiterID) {
            toast.warning('Please select a recruiter to assign');
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                jobID: id,
                recruiterID: data.recruiterID,
                feedbackForm: questions.filter((q) => q.trim().length > 0),
            };

            await api.post('/recruiter/post-recruiter', payload);
            await api.put(`/users/update-user/${data.recruiterID}`, { isAssigned: true });

            toast.success('Recruiter assigned and feedback form configured');
            navigate('/coordinator/review');
        } catch (err) {
            console.error('Assignment error:', err);
            toast.error(err.message || 'Failed to assign recruiter');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center text-sm text-gray-500">
                Loading job assignment workflow...
            </div>
        );
    }

    if (!job) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <p className="text-gray-600 font-semibold">Job not found</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div className="pb-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">Approve Job & Assign Recruiter</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Assign a dedicated recruiter and establish Stage 2 evaluation checkpoints for {job.jobTitle}
                </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* JOB OVERVIEW */}
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                {job.employmentType}
                            </span>
                            <h2 className="text-lg font-bold text-gray-900 mt-1">{job.jobTitle}</h2>
                            <p className="text-xs text-gray-500">{job.location} • Compensation: ₹{job.salary} LPA</p>
                        </div>
                    </div>

                    {/* SELECT RECRUITER */}
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Select Assigned Recruiter *
                        </label>
                        <select
                            {...register('recruiterID', { required: true })}
                            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#087658]"
                        >
                            <option value="">-- Choose a Recruiter --</option>
                            {recruiters.map((r) => (
                                <option key={r._id} value={r._id}>
                                    {r.userName} ({r.userEmail}) {r.isAssigned ? '- Currently Assigned' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* STAGE 2 FEEDBACK FORM QUESTIONS */}
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Stage 2 Recruiter Evaluation Checkpoints</h3>
                                <p className="text-xs text-gray-500">Recruiter will complete these checkpoints when reviewing candidates</p>
                            </div>
                            <button
                                type="button"
                                onClick={addQuestion}
                                className="text-xs font-semibold text-[#087658] hover:underline"
                            >
                                + Add Checkpoint
                            </button>
                        </div>

                        <div className="space-y-2">
                            {questions.map((q, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-400 w-6">{idx + 1}.</span>
                                    <input
                                        type="text"
                                        value={q}
                                        onChange={(e) => handleQuestionChange(idx, e.target.value)}
                                        placeholder="e.g. Meets core technical qualifications?"
                                        className="flex-grow px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-[#087658]"
                                    />
                                    {questions.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(idx)}
                                            className="text-xs text-red-500 hover:text-red-700 px-2"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/coordinator/review')}
                            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 text-xs font-semibold text-white bg-[#087658] hover:bg-[#065e46] rounded-lg shadow-sm disabled:opacity-50"
                        >
                            {isSubmitting ? 'Assigning...' : 'Approve & Assign Recruiter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

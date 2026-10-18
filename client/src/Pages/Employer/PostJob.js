import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

export const PostJob = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
    } = useForm({
        defaultValues: {
            jobTitle: '',
            employmentType: 'Full Time',
            location: '',
            salary: '',
            description: '',
            applicationForm: {
                question: [''],
                answer: ['Yes'],
            },
        },
    });

    const [questions, setQuestions] = useState([{ question: '', answer: 'Yes' }]);

    const addQuestion = (e) => {
        e.preventDefault();
        if (questions.length < 5) {
            setQuestions([...questions, { question: '', answer: 'Yes' }]);
        }
    };

    const handleDeleteQuestion = (index) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, qIndex) => qIndex !== index));
        }
    };

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);
            await api.post('/jobs/post-job', data);
            toast.success('Job posted successfully!');
            navigate('/all-jobs');
        } catch (error) {
            console.error('Failed to post job:', error);
            toast.error(error.message || 'Failed to post job');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Create New Job Posting</h1>
                <p className="text-sm text-gray-500 mt-1">Configure role specifications, compensation, and candidate screening questions</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* LEFT COLUMN: JOB DETAILS */}
                        <div className="space-y-4">
                            <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100">
                                1. Role Information
                            </h2>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                    Job Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    {...register('jobTitle', { required: true })}
                                    placeholder="e.g. Senior Full Stack Engineer"
                                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087658] focus:border-transparent outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Type *
                                    </label>
                                    <select
                                        {...register('employmentType')}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087658] focus:border-transparent outline-none"
                                    >
                                        <option value="Full Time">Full Time</option>
                                        <option value="Part Time">Part Time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Internship">Internship</option>
                                        <option value="Remote">Remote</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Salary (LPA) *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        {...register('salary', { required: true })}
                                        placeholder="e.g. 18"
                                        className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087658] focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                    Location *
                                </label>
                                <input
                                    type="text"
                                    required
                                    {...register('location', { required: true })}
                                    placeholder="e.g. Bengaluru / Hybrid"
                                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087658] focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                    Job Description & Required Skills *
                                </label>
                                <textarea
                                    rows={5}
                                    required
                                    {...register('description', { required: true })}
                                    placeholder="Describe responsibilities, required skills (e.g. React, Node.js, Python), and expectations..."
                                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087658] focus:border-transparent outline-none"
                                />
                            </div>
                        </div>

                        {/* RIGHT COLUMN: SCREENING QUESTIONS */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                <h2 className="text-base font-bold text-gray-900">
                                    2. Stage 1 Screening Questions
                                </h2>
                                <span className="text-xs text-gray-500">Up to 5 questions</span>
                            </div>

                            <p className="text-xs text-gray-500 leading-relaxed">
                                Candidates must answer these qualification checkpoints when submitting their application.
                            </p>

                            <div className="space-y-3">
                                {questions.map((_, index) => (
                                    <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-gray-700">Question {index + 1}</span>
                                            {questions.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteQuestion(index)}
                                                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            {...register(`applicationForm.question.${index}`, { required: true })}
                                            placeholder="e.g. Do you have 3+ years experience with React and Node.js?"
                                            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:ring-1 focus:ring-[#087658] outline-none"
                                        />
                                        <div className="flex items-center gap-4 text-xs text-gray-600 pt-1">
                                            <span>Expected Answer:</span>
                                            <label className="inline-flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value="Yes"
                                                    defaultChecked
                                                    {...register(`applicationForm.answer.${index}`)}
                                                />
                                                <span>Yes</span>
                                            </label>
                                            <label className="inline-flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value="No"
                                                    {...register(`applicationForm.answer.${index}`)}
                                                />
                                                <span>No</span>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {questions.length < 5 && (
                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="w-full py-2 text-xs font-semibold text-[#087658] border border-dashed border-[#087658] rounded-lg hover:bg-emerald-50/50 transition-colors"
                                >
                                    + Add Screening Question
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/all-jobs')}
                            className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#087658] hover:bg-[#065e46] rounded-lg shadow-sm transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? 'Publishing Job...' : 'Publish Job Posting'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

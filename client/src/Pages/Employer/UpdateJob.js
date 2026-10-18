import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

export const UpdateJob = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
    } = useForm({
        defaultValues: {
            jobTitle: '',
            employmentType: 'Full Time',
            location: '',
            salary: '',
            description: '',
        },
    });

    useEffect(() => {
        const fetchJob = async () => {
            try {
                setIsLoading(true);
                const data = await api.get(`/jobs/current-job/${id}`);
                if (data) {
                    reset({
                        jobTitle: data.jobTitle || '',
                        employmentType: data.employmentType || 'Full Time',
                        location: data.location || '',
                        salary: data.salary || '',
                        description: data.description || '',
                    });
                }
            } catch (err) {
                console.error('Error loading job:', err);
                toast.error('Failed to load job details');
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchJob();
    }, [id, reset]);

    const onSubmit = async (data) => {
        try {
            setIsSaving(true);
            await api.put(`/jobs/update-job/${id}`, {
                jobId: id,
                ...data,
            });
            toast.success('Job updated successfully');
            navigate('/all-jobs');
        } catch (error) {
            console.error('Error updating job:', error);
            toast.error(error.message || 'Failed to update job');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center text-sm text-gray-500">
                Loading job details...
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Edit Job Posting</h1>
                <p className="text-sm text-gray-500 mt-1">Update specifications and requirements for this role</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                            Job Title *
                        </label>
                        <input
                            type="text"
                            required
                            {...register('jobTitle', { required: true })}
                            className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087658] outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Employment Type *
                            </label>
                            <select
                                {...register('employmentType')}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087658] outline-none"
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
                                Salary (in LPA) *
                            </label>
                            <input
                                type="text"
                                required
                                {...register('salary', { required: true })}
                                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087658] outline-none"
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
                            className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087658] outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                            Description & Skills *
                        </label>
                        <textarea
                            rows={6}
                            required
                            {...register('description', { required: true })}
                            className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087658] outline-none"
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/all-jobs')}
                            className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-6 py-2 text-sm font-semibold text-white bg-[#087658] hover:bg-[#065e46] rounded-lg shadow-sm disabled:opacity-50"
                        >
                            {isSaving ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

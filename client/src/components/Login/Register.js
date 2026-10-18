import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Logo } from '../Logo';
import api from '../../services/api';

export const Register = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            userName: '',
            userEmail: '',
            userPassword: '',
            gender: 'Male',
            address: '',
            role: 'recruiter',
            isAssigned: false,
            applications: [],
        },
    });

    const onSubmit = async (data) => {
        try {
            setIsLoading(true);
            await api.post('/auth/register', data);
            toast.success('Registration successful! Please sign in.');
            navigate('/login');
        } catch (err) {
            console.error('Registration error:', err);
            toast.error(err.message || 'Unable to complete registration');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Logo size="large" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
                    <p className="text-sm text-gray-500 mt-1">Get started with TalentTrack ATS</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            required
                            {...register('userName', { required: true })}
                            placeholder="Alex Morgan"
                            className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087658] outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                            Work Email *
                        </label>
                        <input
                            type="email"
                            required
                            {...register('userEmail', { required: true })}
                            placeholder="alex@example.com"
                            className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087658] outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                            Password *
                        </label>
                        <input
                            type="password"
                            required
                            {...register('userPassword', { required: true, minLength: 6 })}
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087658] outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Gender
                            </label>
                            <select
                                {...register('gender')}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087658] outline-none"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Non-binary">Non-binary</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Role *
                            </label>
                            <select
                                {...register('role', { required: true })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087658] outline-none font-semibold text-emerald-900 bg-emerald-50/50"
                            >
                                <option value="recruiter">Recruiter</option>
                                <option value="candidate">Candidate</option>
                                <option value="coordinator">Coordinator</option>
                                <option value="employer">Employer</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                            Location / Address
                        </label>
                        <input
                            type="text"
                            required
                            {...register('address', { required: true })}
                            placeholder="Bengaluru, Karnataka"
                            className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087658] outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 px-4 text-sm font-semibold rounded-lg text-white bg-[#087658] hover:bg-[#065e46] shadow-sm transition-all disabled:opacity-50 mt-2"
                    >
                        {isLoading ? 'Creating Account...' : 'Complete Registration'}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-gray-500">
                    Already registered?{' '}
                    <Link to="/login" className="font-semibold text-[#087658] hover:underline">
                        Sign in here
                    </Link>
                </div>
            </div>
        </div>
    );
};

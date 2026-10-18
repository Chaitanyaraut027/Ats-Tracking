import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { LoginContext } from '../ContextProvider/Context';
import { Logo } from '../Logo';
import api from '../../services/api';

export const Login = () => {
    const { setLoginData } = useContext(LoginContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        try {
            setIsLoading(true);
            const result = await api.post('/auth/login', data);
            if (result.success) {
                localStorage.setItem('usertoken', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                setLoginData(result.user);
                window.dispatchEvent(new Event('storage'));
                toast.success('Welcome back!');
                if (result.user?.role === 'candidate') {
                    navigate('/all-posted-jobs');
                } else {
                    navigate('/dash');
                }
            } else {
                toast.error(result.error || 'Authentication failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            toast.error(err.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Logo size="large" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
                    <p className="text-sm text-gray-500 mt-1">Access your ATS pipeline, candidate profiles, and jobs</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                            Work Email
                        </label>
                        <input
                            type="email"
                            required
                            {...register('userEmail', { required: true })}
                            placeholder="recruiter@example.com"
                            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087658] outline-none"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Password
                            </label>
                        </div>
                        <input
                            type="password"
                            required
                            {...register('userPassword', { required: true })}
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087658] outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 px-4 text-sm font-semibold rounded-lg text-white bg-[#087658] hover:bg-[#065e46] shadow-sm transition-all disabled:opacity-50 mt-2"
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-gray-500">
                    Don't have an account yet?{' '}
                    <Link to="/signup" className="font-semibold text-[#087658] hover:underline">
                        Register here
                    </Link>
                </div>
            </div>
        </div>
    );
};

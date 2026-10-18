import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import api from '../services/api';
import 'boxicons';

const employerNavItems = [
    { label: 'Overview', path: '/dash' },
    { label: 'Jobs', path: '/all-jobs' },
    { label: 'Post Job', path: '/post-job' },
    { label: 'Candidates', path: '/candidates' },
];

const coordinatorNavItems = [
    { label: 'Overview', path: '/dash' },
    { label: 'Review & Assign', path: '/coordinator/review' },
    { label: 'Candidates', path: '/candidates' },
    { label: 'Shortlisted', path: '/shortlist' },
];

const recruiterNavItems = [
    { label: 'Overview', path: '/dash' },
    { label: 'Pipeline', path: '/recruiter/review' },
    { label: 'Candidates', path: '/candidates' },
    { label: 'Shortlisted', path: '/shortlist' },
];

const candidateNavItems = [
    { label: 'Browse Jobs', path: '/all-posted-jobs' },
    { label: 'My Applications', path: '/my-jobs' },
];

const defaultNavItems = [
    { label: 'Dashboard', path: '/dash' },
    { label: 'Jobs', path: '/all-jobs' },
    { label: 'Candidates', path: '/candidates' },
];

export const Navbar = () => {
    const navigate = useNavigate();
    const [loginData, setLoginData] = useState(null);
    const [navItems, setNavItems] = useState(defaultNavItems);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handlerIsMenuOpen = () => setIsMenuOpen(!isMenuOpen);

    const checkUser = () => {
        try {
            const rawUser = localStorage.getItem('user');
            if (rawUser) {
                const user = JSON.parse(rawUser);
                const activeUser = Array.isArray(user) ? user[0] : user;
                setLoginData(activeUser);
                if (activeUser?.role === 'employer') setNavItems(employerNavItems);
                else if (activeUser?.role === 'coordinator') setNavItems(coordinatorNavItems);
                else if (activeUser?.role === 'recruiter') setNavItems(recruiterNavItems);
                else if (activeUser?.role === 'candidate') setNavItems(candidateNavItems);
                else setNavItems(defaultNavItems);
            } else {
                setLoginData(null);
                setNavItems(defaultNavItems);
            }
        } catch (e) {
            setLoginData(null);
            setNavItems(defaultNavItems);
        }
    };

    useEffect(() => {
        checkUser();
        window.addEventListener('storage', checkUser);
        return () => window.removeEventListener('storage', checkUser);
    }, []);

    const logoutHandler = async () => {
        try {
            await api.post('/auth/logout', {});
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            localStorage.removeItem('user');
            localStorage.removeItem('usertoken');
            localStorage.removeItem('token');
            setLoginData(null);
            setNavItems(defaultNavItems);
            navigate('/login');
        }
    };

    const hasToken = !!localStorage.getItem('usertoken') || !!loginData;

    return (
        <div className="w-full bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="flex justify-between items-center h-16">
                    {/* BRAND LOGO */}
                    <Link to="/" className="flex items-center">
                        <Logo />
                    </Link>

                    {/* MAIN DESKTOP NAVIGATION */}
                    <ul className="hidden md:flex items-center gap-8 font-semibold text-sm">
                        {navItems.map(({ label, path }) => (
                            <li key={path}>
                                <NavLink
                                    to={path}
                                    className={({ isActive }) =>
                                        isActive
                                            ? 'text-[#087658] font-bold border-b-2 border-[#087658] pb-1'
                                            : 'text-gray-600 hover:text-gray-900 transition-colors'
                                    }
                                >
                                    {label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>

                    {/* USER PROFILE & ACTIONS */}
                    <div className="hidden md:flex items-center gap-4">
                        {hasToken ? (
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-800 leading-none">
                                        {loginData?.userName || 'Recruiter'}
                                    </p>
                                    <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                                        {loginData?.role || 'User'}
                                    </span>
                                </div>
                                <button
                                    onClick={logoutHandler}
                                    className="text-xs font-semibold px-3 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-red-600 rounded-lg transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="text-sm font-semibold text-gray-700 hover:text-emerald-700 px-4 py-2 transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="text-sm font-semibold bg-[#087658] hover:bg-[#065e46] text-white px-4 py-2 rounded-lg shadow-sm transition-all"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* MOBILE HAMBURGER */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={handlerIsMenuOpen}
                            className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                            aria-label="Toggle menu"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </nav>

                {/* MOBILE MENU DROPDOWN */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100 bg-white">
                        <ul className="flex flex-col gap-3">
                            {navItems.map(({ label, path }) => (
                                <li key={path}>
                                    <NavLink
                                        to={path}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={({ isActive }) =>
                                            isActive
                                                ? 'block px-3 py-2 rounded-md font-bold text-[#087658] bg-emerald-50'
                                                : 'block px-3 py-2 rounded-md font-medium text-gray-700 hover:bg-gray-50'
                                        }
                                    >
                                        {label}
                                    </NavLink>
                                </li>
                            ))}
                            <li className="pt-3 border-t border-gray-100">
                                {hasToken ? (
                                    <div className="flex justify-between items-center px-3 py-2">
                                        <span className="text-sm font-medium text-gray-700">
                                            {loginData?.userName || 'Signed in'}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                logoutHandler();
                                            }}
                                            className="text-xs font-semibold px-3 py-1.5 bg-red-50 text-red-600 rounded-md"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2 px-3">
                                        <Link
                                            to="/login"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="w-full text-center py-2 text-sm font-medium border border-gray-200 rounded-md"
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            to="/signup"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="w-full text-center py-2 text-sm font-medium bg-[#087658] text-white rounded-md"
                                        >
                                            Register
                                        </Link>
                                    </div>
                                )}
                            </li>
                        </ul>
                    </div>
                )}
            </div>
            <Outlet />
        </div>
    );
};

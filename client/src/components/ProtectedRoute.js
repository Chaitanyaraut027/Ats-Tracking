import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';

/**
 * ProtectedRoute: Enforces authentication and Role-Based Access Control (RBAC)
 * on client-side routes.
 *
 * @param {Array<string>} allowedRoles - Array of roles permitted on this route ('employer', 'coordinator', 'recruiter', 'candidate')
 * @param {React.ReactNode} children - Route component to render if authorized
 */
export const ProtectedRoute = ({ allowedRoles = [], children }) => {
    const location = useLocation();

    let user = null;
    let token = null;

    try {
        const rawUser = localStorage.getItem('user');
        token = localStorage.getItem('usertoken') || localStorage.getItem('token');
        if (rawUser) {
            const parsed = JSON.parse(rawUser);
            user = Array.isArray(parsed) ? parsed[0] : parsed;
        }
    } catch (e) {
        user = null;
    }

    // 1. Not Authenticated -> Redirect to Login
    if (!token || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Role Check (if specific roles are required)
    if (allowedRoles.length > 0) {
        const userRole = (user.role || '').toLowerCase();
        const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());

        if (!normalizedAllowed.includes(userRole)) {
            const fallbackPath = userRole === 'candidate' ? '/all-posted-jobs' : '/dash';

            return (
                <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
                    <div className="max-w-md w-full bg-white rounded-2xl border border-red-100 p-8 shadow-sm text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl font-bold shadow-inner">
                            🔒
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            Your account role is currently{' '}
                            <span className="font-semibold text-gray-900 uppercase bg-gray-100 px-2 py-0.5 rounded text-xs">
                                {user.role || 'unknown'}
                            </span>
                            . This section requires one of the following permissions:{' '}
                            <span className="font-medium text-[#087658]">
                                {allowedRoles.join(', ')}
                            </span>.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                to={fallbackPath}
                                className="px-5 py-2.5 bg-[#087658] hover:bg-[#065e46] text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
                            >
                                Return to {userRole === 'candidate' ? 'Job Listings' : 'Dashboard'}
                            </Link>
                            <Link
                                to="/"
                                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-all"
                            >
                                Home
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }
    }

    // 3. Authorized -> Render children
    return children;
};

export default ProtectedRoute;

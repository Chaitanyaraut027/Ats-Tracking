import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const secret = process.env.JWT_SECRET || 'atsjwtkey';

/**
 * Authentication middleware: verifies JWT token and attaches user to req
 */
export const authenticate = async (req, res, next) => {
    try {
        let token = req.headers.authorization || req.headers.token;

        if (!token) {
            return res.status(401).json({
                status: 401,
                success: false,
                message: 'Authentication required. Please sign in to proceed.',
            });
        }

        // Support Bearer prefix if provided
        if (token.startsWith('Bearer ')) {
            token = token.slice(7).trim();
        }

        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                status: 401,
                success: false,
                message: 'User account not found or session expired.',
            });
        }

        req.token = token;
        req.userId = decoded.userId;
        req.user = user;

        next();
    } catch (error) {
        return res.status(401).json({
            status: 401,
            success: false,
            message: 'Invalid or expired authentication session.',
            error: error.message,
        });
    }
};

/**
 * Role-Based Access Control (RBAC) middleware:
 * Validates that authenticated user has one of the required roles.
 *
 * Supported roles: 'employer', 'coordinator', 'recruiter', 'candidate'
 */
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 401,
                success: false,
                message: 'Authentication required before checking permissions.',
            });
        }

        const userRole = (req.user.role || '').toLowerCase();
        const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());

        if (!normalizedAllowedRoles.includes(userRole)) {
            return res.status(403).json({
                status: 403,
                success: false,
                message: `Access denied. Role '${req.user.role}' is not authorized to perform this action. Required role(s): ${allowedRoles.join(', ')}.`,
            });
        }

        next();
    };
};

/**
 * Optional authentication middleware:
 * Populates req.user if a valid token is present, but doesn't block guests.
 */
export const optionalAuthenticate = async (req, res, next) => {
    try {
        let token = req.headers.authorization || req.headers.token;
        if (!token) return next();

        if (token.startsWith('Bearer ')) {
            token = token.slice(7).trim();
        }

        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.userId);
        if (user) {
            req.token = token;
            req.userId = decoded.userId;
            req.user = user;
        }
    } catch (e) {
        // Continue unauthenticated
    }
    next();
};
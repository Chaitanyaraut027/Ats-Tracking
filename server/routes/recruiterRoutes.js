import express from 'express';
import { addRecruiter } from '../controllers/Recruiter/addRecruiter.js';
import { allRecruiter } from '../controllers/Recruiter/allRecruiter.js';
import { getRecruiter } from '../controllers/Recruiter/getRecruiter.js';
import { authenticate, authorizeRoles } from '../middleware/VerifyToken.js';

const router = express.Router();

// Coordinator / Employer assigns or adds recruiter
router.post('/post-recruiter', authenticate, authorizeRoles('coordinator', 'employer'), addRecruiter);

// Internal staff view recruiter details
router.get('/get-recruiter/:id', authenticate, authorizeRoles('coordinator', 'employer', 'recruiter'), getRecruiter);
router.get('/all-recruiter', authenticate, authorizeRoles('coordinator', 'employer', 'recruiter'), allRecruiter);

export default router;
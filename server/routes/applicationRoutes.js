import express from 'express';
import { addApplication } from '../controllers/Application/addApplication.js';
import { getApplications } from '../controllers/Application/getApplications.js';
import { getApplication } from '../controllers/Application/getApplication.js';
import { authenticate, authorizeRoles, optionalAuthenticate } from '../middleware/VerifyToken.js';

const router = express.Router();

// Candidate submits application
router.post('/post-application', optionalAuthenticate, addApplication);

// Retrieve single application details
router.get('/get-application/:id', authenticate, getApplication);

// View all applications - restricted to internal hiring team
router.get('/all-application/', authenticate, authorizeRoles('employer', 'recruiter', 'coordinator'), getApplications);

export default router;
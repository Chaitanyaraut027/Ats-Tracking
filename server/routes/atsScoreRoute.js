import express from 'express';
import { scoreCandidateForJob, directScore } from '../controllers/atsScoreController.js';
import { authenticate, authorizeRoles } from '../middleware/VerifyToken.js';

const router = express.Router();

// Score candidate against a job (or custom JD) - restricted to recruiter/coordinator/employer
router.post('/candidates/:candidateId/score', authenticate, authorizeRoles('employer', 'recruiter', 'coordinator'), scoreCandidateForJob);

// Generic direct score proxy - restricted to recruiter/coordinator/employer
router.post('/score', authenticate, authorizeRoles('employer', 'recruiter', 'coordinator'), directScore);

export default router;

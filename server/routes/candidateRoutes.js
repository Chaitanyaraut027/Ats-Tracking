import express from 'express';
import {
    getCandidates,
    getCandidateById,
    addCandidate,
    updateCandidate,
    updateCandidateStage,
    addCandidateNote,
    deleteCandidate,
} from '../controllers/candidateController.js';
import { authenticate, authorizeRoles } from '../middleware/VerifyToken.js';

const router = express.Router();

// Candidate evaluation & pipeline operations (restricted to internal recruitment staff)
router.get('/', authenticate, authorizeRoles('employer', 'recruiter', 'coordinator'), getCandidates);
router.post('/', authenticate, authorizeRoles('employer', 'recruiter', 'coordinator'), addCandidate);
router.get('/:id', authenticate, authorizeRoles('employer', 'recruiter', 'coordinator'), getCandidateById);
router.put('/:id', authenticate, authorizeRoles('employer', 'recruiter', 'coordinator'), updateCandidate);
router.put('/:id/stage', authenticate, authorizeRoles('employer', 'recruiter', 'coordinator'), updateCandidateStage);
router.post('/:id/notes', authenticate, authorizeRoles('employer', 'recruiter', 'coordinator'), addCandidateNote);

// Candidate deletion (restricted to employer/admin)
router.delete('/:id', authenticate, authorizeRoles('employer'), deleteCandidate);

export default router;

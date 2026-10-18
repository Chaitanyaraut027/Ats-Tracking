import express from 'express';
import { getJobs } from '../controllers/Job/getJobs.js';
import { getJob } from '../controllers/Job/getJob.js';
import { addJob } from '../controllers/Job/addJob.js';
import { deleteJob } from '../controllers/Job/deleteJob.js';
import { updateJob } from '../controllers/Job/updateJob.js';
import { updateJobByCandidate } from '../controllers/Job/updateJobByCandidate.js';
import { authenticate, authorizeRoles, optionalAuthenticate } from '../middleware/VerifyToken.js';

const router = express.Router();

// Public / Candidate job browsing
router.get('/all-jobs', optionalAuthenticate, getJobs);
router.get('/current-job/:id', optionalAuthenticate, getJob);

// Employer / Coordinator Job Management
router.post('/post-job', authenticate, authorizeRoles('employer', 'coordinator'), addJob);
router.put('/update-job/:id', authenticate, authorizeRoles('employer', 'coordinator'), updateJob);
router.delete('/delete-job/:id', authenticate, authorizeRoles('employer'), deleteJob);

// Candidate Job Application updates
router.put('/update-job-by-candidate/', authenticate, updateJobByCandidate);

export default router;
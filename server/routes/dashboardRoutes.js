import express from 'express';
import { getDashboardMetrics } from '../controllers/dashboardController.js';
import { authenticate, authorizeRoles } from '../middleware/VerifyToken.js';

const router = express.Router();

// ATS Metrics Dashboard - restricted to recruiter/coordinator/employer
router.get('/metrics', authenticate, authorizeRoles('employer', 'recruiter', 'coordinator'), getDashboardMetrics);

export default router;

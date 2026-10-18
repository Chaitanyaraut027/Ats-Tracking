import express from 'express';
import { getUsers } from '../controllers/User/getUsers.js';
import { getUser } from '../controllers/User/getUser.js';
import { addUser } from '../controllers/User/addUser.js';
import { deleteUser } from '../controllers/User/deleteUser.js';
import { updateUser } from '../controllers/User/updateUser.js';
import { updateUserByCandidate } from '../controllers/User/updateUserByCandidate.js';
import { authenticate, authorizeRoles } from '../middleware/VerifyToken.js';

const router = express.Router();

// Employer / Coordinator user management
router.get('/all-users', authenticate, authorizeRoles('employer', 'coordinator'), getUsers);
router.post('/add-user', authenticate, authorizeRoles('employer', 'coordinator'), addUser);
router.get('/user/:id', authenticate, getUser);
router.put('/update-user/:id', authenticate, updateUser);
router.delete('/delete-user/:id', authenticate, authorizeRoles('employer'), deleteUser);

// Candidate profile updates
router.put('/update-user-by-candidate/', authenticate, updateUserByCandidate);

export default router;
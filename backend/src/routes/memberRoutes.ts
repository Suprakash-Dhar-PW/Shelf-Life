import { Router } from 'express';
import { createMember, getMemberHistory, getAllMembers } from '../controllers/memberController.js';
import { validate } from '../middleware/validate.js';
import { createMemberSchema } from '../validators/memberValidator.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getAllMembers);
router.post('/', requireAuth, requireRole('librarian'), validate(createMemberSchema), createMember);
router.get('/:id/history', requireAuth, getMemberHistory);

export const memberRoutes = router;

import { Router } from 'express';
import { issueBook, returnBook } from '../controllers/borrowController.js';
import { validate } from '../middleware/validate.js';
import { issueBookSchema } from '../validators/borrowValidator.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect all borrow routes
router.use(requireAuth, requireRole('librarian'));

router.post('/borrow', validate(issueBookSchema), issueBook);
router.post('/return/:borrowId', returnBook);

export const borrowRoutes = router;

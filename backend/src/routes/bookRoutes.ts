import { Router } from 'express';
import { createBook, getBooks } from '../controllers/bookController.js';
import { validate } from '../middleware/validate.js';
import { createBookSchema } from '../validators/bookValidator.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, requireRole('librarian'), validate(createBookSchema), createBook);
router.get('/', getBooks);

export const bookRoutes = router;

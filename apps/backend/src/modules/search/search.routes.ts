import { Router } from 'express';

import { asyncHandler } from '../../middleware/async-handler';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';

import { searchController } from './search.controller';
import { searchQuerySchema, suggestQuerySchema } from './search.schemas';

const router: Router = Router();

router.get('/', validate({ query: searchQuerySchema }), asyncHandler(searchController.search));
router.get(
  '/suggest',
  validate({ query: suggestQuerySchema }),
  asyncHandler(searchController.suggest),
);
router.post(
  '/admin/reindex',
  authenticate,
  requireRole('admin'),
  asyncHandler(searchController.reindex),
);

export default router;

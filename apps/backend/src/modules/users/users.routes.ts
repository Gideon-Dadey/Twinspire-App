import { Router } from 'express';

import { asyncHandler } from '../../middleware/async-handler';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';

import { usersController } from './users.controller';
import {
  addressBodySchema,
  addressParamsSchema,
  addressUpdateBodySchema,
  updatePreferencesBodySchema,
  updateProfileBodySchema,
} from './users.schemas';

const router: Router = Router();

router.use(authenticate);

router.get('/me', asyncHandler(usersController.getMe));
router.patch(
  '/me',
  validate({ body: updateProfileBodySchema }),
  asyncHandler(usersController.updateMe),
);
router.patch(
  '/me/preferences',
  validate({ body: updatePreferencesBodySchema }),
  asyncHandler(usersController.updatePreferences),
);
router.delete('/me', asyncHandler(usersController.deleteAccount));

router.get('/me/addresses', asyncHandler(usersController.listAddresses));
router.post(
  '/me/addresses',
  validate({ body: addressBodySchema }),
  asyncHandler(usersController.createAddress),
);
router.patch(
  '/me/addresses/:addressId',
  validate({ params: addressParamsSchema, body: addressUpdateBodySchema }),
  asyncHandler(usersController.updateAddress),
);
router.delete(
  '/me/addresses/:addressId',
  validate({ params: addressParamsSchema }),
  asyncHandler(usersController.deleteAddress),
);
router.post(
  '/me/addresses/:addressId/default',
  validate({ params: addressParamsSchema }),
  asyncHandler(usersController.setDefaultAddress),
);

export default router;

import { Router } from 'express';

import { asyncHandler } from '../../middleware/async-handler';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';

import { catalogController } from './catalog.controller';
import {
  brandSlugParamsSchema,
  categorySlugParamsSchema,
  createBrandBodySchema,
  createCategoryBodySchema,
  createProductBodySchema,
  productIdParamsSchema,
  productListQuerySchema,
  productSlugParamsSchema,
  updateBrandBodySchema,
  updateCategoryBodySchema,
  updateProductBodySchema,
} from './catalog.schemas';

const router: Router = Router();

/* Public — products */
router.get(
  '/products',
  validate({ query: productListQuerySchema }),
  asyncHandler(catalogController.listProducts),
);
router.get('/products/featured', asyncHandler(catalogController.featured));
router.get('/products/best-sellers', asyncHandler(catalogController.bestSellers));
router.get('/products/new-arrivals', asyncHandler(catalogController.newArrivals));
router.get(
  '/products/:slug',
  validate({ params: productSlugParamsSchema }),
  asyncHandler(catalogController.getProduct),
);
router.get(
  '/products/:slug/related',
  validate({ params: productSlugParamsSchema }),
  asyncHandler(catalogController.related),
);

/* Public — categories */
router.get('/categories', asyncHandler(catalogController.categoryTree));
router.get(
  '/categories/:slug',
  validate({ params: categorySlugParamsSchema }),
  asyncHandler(catalogController.getCategory),
);

/* Public — brands */
router.get('/brands', asyncHandler(catalogController.listBrands));
router.get(
  '/brands/:slug',
  validate({ params: brandSlugParamsSchema }),
  asyncHandler(catalogController.getBrand),
);

/* Admin */
router.post(
  '/admin/products',
  authenticate,
  requireRole('manager'),
  validate({ body: createProductBodySchema }),
  asyncHandler(catalogController.adminCreateProduct),
);
router.patch(
  '/admin/products/:productId',
  authenticate,
  requireRole('manager'),
  validate({ params: productIdParamsSchema, body: updateProductBodySchema }),
  asyncHandler(catalogController.adminUpdateProduct),
);
router.delete(
  '/admin/products/:productId',
  authenticate,
  requireRole('admin'),
  validate({ params: productIdParamsSchema }),
  asyncHandler(catalogController.adminDeleteProduct),
);

router.post(
  '/admin/categories',
  authenticate,
  requireRole('manager'),
  validate({ body: createCategoryBodySchema }),
  asyncHandler(catalogController.adminCreateCategory),
);
router.patch(
  '/admin/categories/:categoryId',
  authenticate,
  requireRole('manager'),
  validate({ body: updateCategoryBodySchema }),
  asyncHandler(catalogController.adminUpdateCategory),
);
router.delete(
  '/admin/categories/:categoryId',
  authenticate,
  requireRole('admin'),
  asyncHandler(catalogController.adminDeleteCategory),
);

router.post(
  '/admin/brands',
  authenticate,
  requireRole('manager'),
  validate({ body: createBrandBodySchema }),
  asyncHandler(catalogController.adminCreateBrand),
);
router.patch(
  '/admin/brands/:brandId',
  authenticate,
  requireRole('manager'),
  validate({ body: updateBrandBodySchema }),
  asyncHandler(catalogController.adminUpdateBrand),
);
router.delete(
  '/admin/brands/:brandId',
  authenticate,
  requireRole('admin'),
  asyncHandler(catalogController.adminDeleteBrand),
);

export default router;

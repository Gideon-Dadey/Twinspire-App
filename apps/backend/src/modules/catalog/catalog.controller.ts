
import { auditService } from '../../services/audit.service';
import { sendCreated, sendNoContent, sendSuccess } from '../../utils/response';

import { catalogService } from './catalog.service';

import type { ProductListQuery } from './catalog.schemas';
import type { Request, Response } from 'express';

export const catalogController = {
  /* ---------- Products: public ---------- */

  async listProducts(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as ProductListQuery;
    const result = await catalogService.listProducts(query);
    sendSuccess(res, { items: result.items, facets: result.facets }, 200, { pagination: result.meta });
  },

  async getProduct(req: Request, res: Response): Promise<void> {
    const { slug } = req.params as { slug: string };
    const product = await catalogService.getProductBySlug(slug);
    void catalogService.incrementView(product._id);
    sendSuccess(res, { product });
  },

  async related(req: Request, res: Response): Promise<void> {
    const { slug } = req.params as { slug: string };
    const product = await catalogService.getProductBySlug(slug);
    const items = await catalogService.related(product._id, product.primaryCategoryId);
    sendSuccess(res, { items });
  },

  async featured(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, { items: await catalogService.featured() });
  },

  async bestSellers(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, { items: await catalogService.bestSellers() });
  },

  async newArrivals(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, { items: await catalogService.newArrivals() });
  },

  /* ---------- Categories: public ---------- */

  async categoryTree(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, { tree: await catalogService.categoryTree() });
  },

  async getCategory(req: Request, res: Response): Promise<void> {
    const { slug } = req.params as { slug: string };
    const category = await catalogService.getCategoryBySlug(slug);
    const breadcrumb = await catalogService.categoryBreadcrumb(slug);
    sendSuccess(res, { category, breadcrumb });
  },

  /* ---------- Brands: public ---------- */

  async listBrands(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, { items: await catalogService.listBrands() });
  },

  async getBrand(req: Request, res: Response): Promise<void> {
    const { slug } = req.params as { slug: string };
    sendSuccess(res, { brand: await catalogService.getBrandBySlug(slug) });
  },

  /* ---------- Admin: products ---------- */

  async adminCreateProduct(req: Request, res: Response): Promise<void> {
    const product = await catalogService.createProduct(req.body as Record<string, unknown>);
    await auditService.fromRequest(req, {
      action: 'create',
      targetType: 'Product',
      targetId: product._id,
    });
    sendCreated(res, { product });
  },

  async adminUpdateProduct(req: Request, res: Response): Promise<void> {
    const { productId } = req.params as { productId: string };
    const product = await catalogService.updateProduct(productId, req.body as Record<string, unknown>);
    await auditService.fromRequest(req, { action: 'update', targetType: 'Product', targetId: productId });
    sendSuccess(res, { product });
  },

  async adminDeleteProduct(req: Request, res: Response): Promise<void> {
    const { productId } = req.params as { productId: string };
    await catalogService.softDeleteProduct(productId);
    await auditService.fromRequest(req, { action: 'delete', targetType: 'Product', targetId: productId });
    sendNoContent(res);
  },

  /* ---------- Admin: categories ---------- */

  async adminCreateCategory(req: Request, res: Response): Promise<void> {
    const category = await catalogService.createCategory(req.body as Record<string, unknown>);
    await auditService.fromRequest(req, { action: 'create', targetType: 'Category', targetId: category._id });
    sendCreated(res, { category });
  },

  async adminUpdateCategory(req: Request, res: Response): Promise<void> {
    const { categoryId } = req.params as { categoryId: string };
    const category = await catalogService.updateCategory(categoryId, req.body as Record<string, unknown>);
    await auditService.fromRequest(req, { action: 'update', targetType: 'Category', targetId: categoryId });
    sendSuccess(res, { category });
  },

  async adminDeleteCategory(req: Request, res: Response): Promise<void> {
    const { categoryId } = req.params as { categoryId: string };
    await catalogService.deleteCategory(categoryId);
    await auditService.fromRequest(req, { action: 'delete', targetType: 'Category', targetId: categoryId });
    sendNoContent(res);
  },

  /* ---------- Admin: brands ---------- */

  async adminCreateBrand(req: Request, res: Response): Promise<void> {
    const brand = await catalogService.createBrand(req.body as Record<string, unknown>);
    await auditService.fromRequest(req, { action: 'create', targetType: 'Brand', targetId: brand._id });
    sendCreated(res, { brand });
  },

  async adminUpdateBrand(req: Request, res: Response): Promise<void> {
    const { brandId } = req.params as { brandId: string };
    const brand = await catalogService.updateBrand(brandId, req.body as Record<string, unknown>);
    await auditService.fromRequest(req, { action: 'update', targetType: 'Brand', targetId: brandId });
    sendSuccess(res, { brand });
  },

  async adminDeleteBrand(req: Request, res: Response): Promise<void> {
    const { brandId } = req.params as { brandId: string };
    await catalogService.deleteBrand(brandId);
    await auditService.fromRequest(req, { action: 'delete', targetType: 'Brand', targetId: brandId });
    sendNoContent(res);
  },
};

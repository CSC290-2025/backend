import type { Context } from 'hono';
import { ProductService } from '../services';
import { successResponse } from '@/utils/response';

const getProduct = async (c: Context) => {
  const id = c.req.param('id');
  const product = await ProductService.getProductById(id);
  return successResponse(c, { product });
};

const createProduct = async (c: Context) => {
  const body = await c.req.json();
  const product = await ProductService.createProduct(body);
  return successResponse(c, { product }, 201, 'Product created successfully');
};

const updateProduct = async (c: Context) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const product = await ProductService.updateProduct(id, body);
  return successResponse(c, { product }, 200, 'Product updated successfully');
};

const deleteProduct = async (c: Context) => {
  const id = c.req.param('id');
  await ProductService.deleteProduct(id);
  return successResponse(c, null, 200, 'Product deleted successfully');
};

const listProducts = async (c: Context) => {
  const query = c.req.query();

  const filters = {
    category: query.category,
    minPrice: query.minPrice ? Number(query.minPrice) : undefined,
    maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
    search: query.search,
  };

  const pagination = {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
    sortBy: (query.sortBy as 'name' | 'price' | 'createdAt') || 'createdAt',
    sortOrder: (query.sortOrder as 'asc' | 'desc') || 'desc',
  };

  const result = await ProductService.listProducts(filters, pagination);
  return successResponse(c, result);
};

const getProductsByCategory = async (c: Context) => {
  const category = c.req.param('category');
  const products = await ProductService.getProductsByCategory(category);
  return successResponse(c, { products });
};

const getCategoryStats = async (c: Context) => {
  const stats = await ProductService.getCategoryStats();
  return successResponse(c, { stats });
};

const getPriceStats = async (c: Context) => {
  const stats = await ProductService.getPriceStatistics();
  return successResponse(c, { stats });
};

export {
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  listProducts,
  getProductsByCategory,
  getCategoryStats,
  getPriceStats,
};

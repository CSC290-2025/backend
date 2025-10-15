import { ProductModel } from '../models';
import type {
  CreateProductData,
  Product,
  UpdateProductData,
  ProductFilterOptions,
  PaginationOptions,
  PaginatedProducts,
} from '../types';
import { NotFoundError, ValidationError } from '@/errors';

const getProductById = async (id: string): Promise<Product> => {
  const product = await ProductModel.findById(id);
  if (!product) throw new NotFoundError('Product not found');
  return product;
};

const createProduct = async (data: CreateProductData): Promise<Product> => {
  if (!data.name) {
    throw new ValidationError('Product name is required');
  }
  if (data.price <= 0) {
    throw new ValidationError('Price must be greater than 0');
  }

  return await ProductModel.create(data);
};

const updateProduct = async (
  id: string,
  data: UpdateProductData
): Promise<Product> => {
  const existingProduct = await ProductModel.findById(id);
  if (!existingProduct) throw new NotFoundError('Product not found');

  // Zod schema already validates price if provided, so no need for additional validation here

  return await ProductModel.update(id, data);
};

const deleteProduct = async (id: string): Promise<void> => {
  const product = await ProductModel.findById(id);
  if (!product) throw new NotFoundError('Product not found');

  await ProductModel.deleteById(id);
};

const listProducts = async (
  filters: ProductFilterOptions,
  pagination: PaginationOptions
): Promise<PaginatedProducts> => {
  return await ProductModel.findWithPagination(filters, pagination);
};

const getProductsByCategory = async (category: string): Promise<Product[]> => {
  return await ProductModel.findByCategory(category);
};

const getCategoryStats = async (): Promise<Record<string, number>> => {
  return await ProductModel.countByCategory();
};

const getPriceStatistics = async (): Promise<{
  min: number;
  max: number;
  avg: number;
  count: number;
}> => {
  return await ProductModel.getPriceStats();
};

export {
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  listProducts,
  getProductsByCategory,
  getCategoryStats,
  getPriceStatistics,
};

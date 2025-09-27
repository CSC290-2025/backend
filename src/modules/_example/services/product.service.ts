import { ProductModel } from '../models';
import type { CreateProductData, Product } from '../types';
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

export { getProductById, createProduct };

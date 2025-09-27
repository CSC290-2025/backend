import { handlePrismaError } from '@/errors';
import type { CreateProductData, Product } from '../types';

const findById = async (id: string): Promise<Product | null> => {
  try {
    // TODO: Replace with actual Prisma query
    // const product = await prisma.product.findUnique({ where: { id } });
    // return product;
    return null;
  } catch (error) {
    handlePrismaError(error);
  }
};

const create = async (data: CreateProductData): Promise<Product> => {
  try {
    // TODO: Replace with actual Prisma query
    // const product = await prisma.product.create({ data });
    // return product;
    return { id: '1', ...data };
  } catch (error) {
    handlePrismaError(error);
  }
};

const findByCategory = async (category: string): Promise<Product[]> => {
  try {
    // TODO: Replace with actual Prisma query
    // const products = await prisma.product.findMany({ where: { category } });
    // return products;
    return [];
  } catch (error) {
    handlePrismaError(error);
  }
};

export { findById, create, findByCategory };

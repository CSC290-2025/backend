import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type {
  Product,
  CreateProductData,
  UpdateProductData,
  ProductFilterOptions,
  PaginationOptions,
  PaginatedProducts,
} from '../types';

const findById = async (id: string): Promise<Product | null> => {
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    return product;
  } catch (error) {
    handlePrismaError(error);
  }
};

const create = async (data: CreateProductData): Promise<Product> => {
  try {
    const product = await prisma.product.create({ data });
    return product;
  } catch (error) {
    handlePrismaError(error);
  }
};

const update = async (
  id: string,
  data: UpdateProductData
): Promise<Product> => {
  try {
    const product = await prisma.product.update({
      where: { id },
      data,
    });
    return product;
  } catch (error) {
    handlePrismaError(error);
  }
};

const deleteById = async (id: string): Promise<void> => {
  try {
    await prisma.product.delete({ where: { id } });
  } catch (error) {
    handlePrismaError(error);
  }
};

const findByCategory = async (category: string): Promise<Product[]> => {
  try {
    const products = await prisma.product.findMany({ where: { category } });
    return products;
  } catch (error) {
    handlePrismaError(error);
  }
};

const findWithPagination = async (
  filters: ProductFilterOptions,
  pagination: PaginationOptions
): Promise<PaginatedProducts> => {
  try {
    const { category, minPrice, maxPrice, search } = filters;
    const { page, limit, sortBy, sortOrder } = pagination;

    const where: any = {};

    if (category) where.category = category;

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const countByCategory = async (): Promise<Record<string, number>> => {
  try {
    const result = await prisma.product.groupBy({
      by: ['category'] as const,
      _count: { category: true },
    });

    const counts: Record<string, number> = {};

    for (const item of result as any[]) {
      counts[item.category] = item._count.category;
    }
    return counts;
  } catch (error) {
    handlePrismaError(error);
  }
};

const getAveragePrice = async (): Promise<number> => {
  try {
    const result = await prisma.product.aggregate({
      _avg: { price: true },
    });
    return result._avg.price || 0;
  } catch (error) {
    handlePrismaError(error);
  }
};

const getPriceStats = async (): Promise<{
  min: number;
  max: number;
  avg: number;
  count: number;
}> => {
  try {
    const result = await prisma.product.aggregate({
      _min: { price: true },
      _max: { price: true },
      _avg: { price: true },
      _count: { price: true },
    });

    return {
      min: result._min.price || 0,
      max: result._max.price || 0,
      avg: result._avg.price || 0,
      count: result._count.price,
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

export {
  findById,
  create,
  update,
  deleteById,
  findByCategory,
  findWithPagination,
  countByCategory,
  getAveragePrice,
  getPriceStats,
};

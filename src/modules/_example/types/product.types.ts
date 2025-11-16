import { z } from 'zod';
import { ProductSchemas } from '../schemas';

type Product = z.infer<typeof ProductSchemas.ProductSchema>;
type CreateProductData = z.infer<typeof ProductSchemas.CreateProductSchema>;
type UpdateProductData = z.infer<typeof ProductSchemas.UpdateProductSchema>;
type ProductFilterOptions = z.infer<typeof ProductSchemas.ProductFilterSchema>;
type PaginationOptions = z.infer<typeof ProductSchemas.PaginationSchema>;
type PaginatedProducts = z.infer<typeof ProductSchemas.PaginatedProductsSchema>;

export type {
  Product,
  CreateProductData,
  UpdateProductData,
  ProductFilterOptions,
  PaginationOptions,
  PaginatedProducts,
};

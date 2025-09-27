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

export { getProduct, createProduct };

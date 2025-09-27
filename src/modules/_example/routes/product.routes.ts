import { Hono } from 'hono';
import { ProductController } from '../controllers';

const productRoutes = new Hono();

productRoutes.get('/:id', ProductController.getProduct);
productRoutes.post('/', ProductController.createProduct);

export { productRoutes };

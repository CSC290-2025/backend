import { Hono } from 'hono';
import { PaymentController } from '../controllers';

const paymentRoutes = new Hono();

paymentRoutes.get('/', PaymentController.listPayments);
paymentRoutes.get('/all', PaymentController.listAllPayments);
paymentRoutes.get('/:id', PaymentController.getPayment);
paymentRoutes.post('/', PaymentController.createPayment);
paymentRoutes.put('/:id', PaymentController.updatePayment);
paymentRoutes.delete('/:id', PaymentController.deletePayment);

export { paymentRoutes };

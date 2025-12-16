import { Hono } from 'hono';
import { handleTap } from '../controllers/transaction_transportation.controller';

const transactionRoute = new Hono();
transactionRoute.post('/transactions/tap', handleTap);

export default transactionRoute;

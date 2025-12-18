import { Hono } from 'hono';
import {
  handleTap,
  getHistory,
} from '../controllers/transaction_transportation.controller';

const transactionRoute = new Hono();
transactionRoute.post('/transactions/tap', handleTap);
transactionRoute.get('/transactions/history', getHistory);

export default transactionRoute;

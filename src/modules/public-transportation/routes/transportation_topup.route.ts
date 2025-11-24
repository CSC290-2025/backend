import { Hono } from 'hono';
import { handleTopUp } from '../controllers/transportation_topup.controller';
const topUpRoute = new Hono();

topUpRoute.post('/transactions/topup', handleTopUp);

export default topUpRoute;

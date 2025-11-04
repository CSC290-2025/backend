import { Hono } from 'hono';
import { getRoutesController } from '../controllers/routeFinder.controller';

const app = new Hono();

app.get('/routes/fastest', getRoutesController);
app.get('/routes/all', getRoutesController);

export default app;

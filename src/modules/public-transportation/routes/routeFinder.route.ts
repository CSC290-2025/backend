import { Hono } from 'hono';
import { getRoutesController } from '../controllers/routeFinder.controller';
import { getTransitLinesController } from '../controllers/routeFinder.controller';

const routeStopsRoutes = new Hono();

routeStopsRoutes.get('/routes/fastest', getRoutesController);
routeStopsRoutes.get('/routes/all', getRoutesController);
routeStopsRoutes.get('/routes/lines', getTransitLinesController);

export default routeStopsRoutes;

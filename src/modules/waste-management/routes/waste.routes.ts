import { Hono } from 'hono';
import { WasteController } from '../controllers';

const wasteRoutes = new Hono();

wasteRoutes.get('/waste-types', WasteController.getWasteTypes);
wasteRoutes.post('/waste/log', WasteController.logWaste);
wasteRoutes.get('/waste/stats', WasteController.getWasteStats);

export default wasteRoutes;

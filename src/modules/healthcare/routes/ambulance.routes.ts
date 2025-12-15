import { Hono } from 'hono';
import { AmbulanceController } from '../controllers';

const ambulanceRoutes = new Hono();

ambulanceRoutes.get('/', AmbulanceController.listAmbulances);
ambulanceRoutes.get('/all', AmbulanceController.listAllAmbulances);
ambulanceRoutes.get('/:id', AmbulanceController.getAmbulance);
ambulanceRoutes.post('/', AmbulanceController.createAmbulance);
ambulanceRoutes.put('/:id', AmbulanceController.updateAmbulance);
ambulanceRoutes.delete('/:id', AmbulanceController.deleteAmbulance);

export { ambulanceRoutes };

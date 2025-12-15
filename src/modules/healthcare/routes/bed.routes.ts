import { Hono } from 'hono';
import { BedController } from '../controllers';

const bedRoutes = new Hono();

bedRoutes.get('/', BedController.listBeds);
bedRoutes.get('/all', BedController.listAllBeds);
bedRoutes.get('/:id', BedController.getBed);
bedRoutes.post('/', BedController.createBed);
bedRoutes.put('/:id', BedController.updateBed);
bedRoutes.delete('/:id', BedController.deleteBed);

export { bedRoutes };

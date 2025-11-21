import { Hono } from 'hono';
import { FacilityController } from '../controllers';

const facilityRoutes = new Hono();

facilityRoutes.get('/', FacilityController.listFacilities);
facilityRoutes.get('/all', FacilityController.listAllFacilities);
facilityRoutes.get('/:id', FacilityController.getFacility);
facilityRoutes.post('/', FacilityController.createFacility);
facilityRoutes.put('/:id', FacilityController.updateFacility);
facilityRoutes.delete('/:id', FacilityController.deleteFacility);

export { facilityRoutes };

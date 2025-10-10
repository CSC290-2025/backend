import { Hono } from 'hono';
import * as apartmentController from '../controllers/apartment.Controller';

const apartmentRoutes = new Hono();

apartmentRoutes.get('/:id', apartmentController.getApartmentByID);
apartmentRoutes.get('/', apartmentController.getAllApartment);
apartmentRoutes.post('/', apartmentController.createApartment);
apartmentRoutes.patch('/:id', apartmentController.updateApartment);
apartmentRoutes.delete('/:id', apartmentController.deleteApartment);

export { apartmentRoutes };

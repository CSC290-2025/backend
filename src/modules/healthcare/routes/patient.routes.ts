import { Hono } from 'hono';
import { PatientController } from '../controllers';

const patientRoutes = new Hono();

patientRoutes.get('/', PatientController.listPatients);
patientRoutes.get('/all', PatientController.listAllPatients);
patientRoutes.get('/:id', PatientController.getPatient);
patientRoutes.post('/', PatientController.createPatient);
patientRoutes.put('/:id', PatientController.updatePatient);
patientRoutes.delete('/:id', PatientController.deletePatient);

export { patientRoutes };

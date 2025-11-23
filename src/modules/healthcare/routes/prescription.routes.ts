import { Hono } from 'hono';
import { PrescriptionController } from '../controllers';

const prescriptionRoutes = new Hono();

prescriptionRoutes.get('/', PrescriptionController.listPrescriptions);
prescriptionRoutes.get('/all', PrescriptionController.listAllPrescriptions);
prescriptionRoutes.get('/:id', PrescriptionController.getPrescription);
prescriptionRoutes.post('/', PrescriptionController.createPrescription);
prescriptionRoutes.put('/:id', PrescriptionController.updatePrescription);
prescriptionRoutes.delete('/:id', PrescriptionController.deletePrescription);

export { prescriptionRoutes };

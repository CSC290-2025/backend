import { Hono } from 'hono';
import { EmergencyCallController } from '../controllers';

const emergencyCallRoutes = new Hono();

emergencyCallRoutes.get('/', EmergencyCallController.listEmergencyCalls);
emergencyCallRoutes.get('/all', EmergencyCallController.listAllEmergencyCalls);
emergencyCallRoutes.get('/:id', EmergencyCallController.getEmergencyCall);
emergencyCallRoutes.post('/', EmergencyCallController.createEmergencyCall);
emergencyCallRoutes.put('/:id', EmergencyCallController.updateEmergencyCall);
emergencyCallRoutes.delete('/:id', EmergencyCallController.deleteEmergencyCall);

export { emergencyCallRoutes };

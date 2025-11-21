import { Hono } from 'hono';
import { AppointmentController } from '../controllers';

const appointmentRoutes = new Hono();

appointmentRoutes.get('/', AppointmentController.listAppointments);
appointmentRoutes.get('/all', AppointmentController.listAllAppointments);
appointmentRoutes.get('/:id', AppointmentController.getAppointment);
appointmentRoutes.post('/', AppointmentController.createAppointment);
appointmentRoutes.put('/:id', AppointmentController.updateAppointment);
appointmentRoutes.delete('/:id', AppointmentController.deleteAppointment);

export { appointmentRoutes };

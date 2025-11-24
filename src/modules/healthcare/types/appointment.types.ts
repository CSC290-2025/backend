import type { z } from 'zod';
import type { AppointmentSchemas } from '../schemas';

type Appointment = z.infer<typeof AppointmentSchemas.AppointmentSchema>;
type CreateAppointmentData = z.infer<
  typeof AppointmentSchemas.CreateAppointmentSchema
>;
type UpdateAppointmentData = z.infer<
  typeof AppointmentSchemas.UpdateAppointmentSchema
>;
type AppointmentFilterOptions = z.infer<
  typeof AppointmentSchemas.AppointmentFilterSchema
>;
type AppointmentPaginationOptions = z.infer<
  typeof AppointmentSchemas.AppointmentPaginationSchema
>;
type PaginatedAppointments = z.infer<
  typeof AppointmentSchemas.PaginatedAppointmentsSchema
>;

export type {
  Appointment,
  CreateAppointmentData,
  UpdateAppointmentData,
  AppointmentFilterOptions,
  AppointmentPaginationOptions,
  PaginatedAppointments,
};

import type { Context } from 'hono';
import { DoctorModel } from '../models';
import { DoctorSchemas } from '../schemas';
import { successResponse } from '@/utils/response';
import { NotFoundError } from '@/errors';

export const getDoctor = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const doctor = await DoctorModel.findById(id);

  if (!doctor) {
    throw new NotFoundError('Doctor not found');
  }

  return successResponse(c, doctor);
};

export const createDoctor = async (c: Context) => {
  const body = await c.req.json();
  const data = DoctorSchemas.CreateDoctorSchema.parse(body);
  const doctor = await DoctorModel.create(data);
  return successResponse(c, doctor, 201);
};

export const updateDoctor = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const data = DoctorSchemas.UpdateDoctorSchema.parse(body);
  const doctor = await DoctorModel.update(id, data);

  if (!doctor) {
    throw new NotFoundError('Doctor not found');
  }

  return successResponse(c, doctor);
};

export const deleteDoctor = async (c: Context) => {
  const id = Number(c.req.param('id'));
  await DoctorModel.deleteById(id);
  return successResponse(c, { message: 'Doctor deleted successfully' });
};

export const listDoctors = async (c: Context) => {
  const query = c.req.query();
  const filters = DoctorSchemas.DoctorFilterSchema.parse(query);
  const pagination = DoctorSchemas.DoctorPaginationSchema.parse(query);

  const result = await DoctorModel.findWithPagination(filters, pagination);
  return successResponse(c, result);
};

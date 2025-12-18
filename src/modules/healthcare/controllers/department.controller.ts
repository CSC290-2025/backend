import type { Context } from 'hono';
import { DepartmentSchemas } from '../schemas';
import * as DepartmentModel from '../models/department.model';
import { NotFoundError } from '@/errors';
import { successResponse } from '@/utils/response';

export const getDepartment = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const department = await DepartmentModel.findById(id);
  if (!department) {
    throw new NotFoundError('Department not found');
  }
  return successResponse(c, department);
};

export const createDepartment = async (c: Context) => {
  const body = await c.req.json();
  const data = DepartmentSchemas.CreateDepartmentSchema.parse(body);
  const department = await DepartmentModel.create(data);
  return successResponse(c, department, 201);
};

export const updateDepartment = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const data = DepartmentSchemas.UpdateDepartmentSchema.parse(body);
  const department = await DepartmentModel.update(id, data);
  if (!department) {
    throw new NotFoundError('Department not found');
  }
  return successResponse(c, department);
};

export const deleteDepartment = async (c: Context) => {
  const id = Number(c.req.param('id'));
  await DepartmentModel.deleteById(id);
  return successResponse(c, { message: 'Department deleted successfully' });
};

export const listDepartments = async (c: Context) => {
  const query = c.req.query();
  const filters = DepartmentSchemas.DepartmentFilterSchema.parse(query);
  const pagination = DepartmentSchemas.DepartmentPaginationSchema.parse(query);
  const result = await DepartmentModel.findWithPagination(filters, pagination);
  return successResponse(c, result);
};

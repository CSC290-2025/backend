import type { z } from 'zod';
import type { DepartmentSchemas } from '../schemas';

type Department = z.infer<typeof DepartmentSchemas.DepartmentSchema>;
type CreateDepartmentData = z.infer<
  typeof DepartmentSchemas.CreateDepartmentSchema
>;
type UpdateDepartmentData = z.infer<
  typeof DepartmentSchemas.UpdateDepartmentSchema
>;
type DepartmentFilterOptions = z.infer<
  typeof DepartmentSchemas.DepartmentFilterSchema
>;
type DepartmentPaginationOptions = z.infer<
  typeof DepartmentSchemas.DepartmentPaginationSchema
>;
type PaginatedDepartments = z.infer<
  typeof DepartmentSchemas.PaginatedDepartmentsSchema
>;

export type {
  Department,
  CreateDepartmentData,
  UpdateDepartmentData,
  DepartmentFilterOptions,
  DepartmentPaginationOptions,
  PaginatedDepartments,
};

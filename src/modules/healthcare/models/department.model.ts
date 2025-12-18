import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { Prisma } from '@/generated/prisma';
import type {
  Department,
  CreateDepartmentData,
  UpdateDepartmentData,
  DepartmentFilterOptions,
  DepartmentPaginationOptions,
  PaginatedDepartments,
} from '../types';

const departmentSelect = {
  id: true,
  department_name: true,
  created_at: true,
} satisfies Prisma.departmentsSelect;

type DepartmentRecord = Prisma.departmentsGetPayload<{
  select: typeof departmentSelect;
}>;

const mapDepartment = (record: DepartmentRecord): Department => ({
  id: record.id,
  name: record.department_name,
  createdAt: record.created_at,
});

const buildWhereClause = (
  filters: DepartmentFilterOptions = {}
): Prisma.departmentsWhereInput => {
  const where: Prisma.departmentsWhereInput = {};

  if (filters.search) {
    const term = filters.search.trim();
    if (term.length > 0) {
      where.department_name = { contains: term, mode: 'insensitive' };
    }
  }

  return where;
};

const getOrderBy = (
  sortBy: DepartmentPaginationOptions['sortBy'],
  sortOrder: DepartmentPaginationOptions['sortOrder']
): Prisma.departmentsOrderByWithRelationInput => {
  switch (sortBy) {
    case 'id':
      return { id: sortOrder };
    case 'name':
      return { department_name: sortOrder };
    case 'createdAt':
    default:
      return { created_at: sortOrder };
  }
};

const findById = async (id: number): Promise<Department | null> => {
  try {
    const record = await prisma.departments.findUnique({
      where: { id },
      select: departmentSelect,
    });
    return record ? mapDepartment(record) : null;
  } catch (error) {
    handlePrismaError(error);
  }
};

const findWithPagination = async (
  filters: DepartmentFilterOptions,
  pagination: DepartmentPaginationOptions
): Promise<PaginatedDepartments> => {
  try {
    const where = buildWhereClause(filters);
    const orderBy = getOrderBy(pagination.sortBy, pagination.sortOrder);

    const [records, total] = await Promise.all([
      prisma.departments.findMany({
        where,
        select: departmentSelect,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy,
      }),
      prisma.departments.count({ where }),
    ]);

    return {
      departments: records.map(mapDepartment),
      total,
      page: pagination.page,
      totalPages: Math.ceil(total / pagination.limit),
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const create = async (data: CreateDepartmentData): Promise<Department> => {
  try {
    const record = await prisma.departments.create({
      data: { department_name: data.name },
      select: departmentSelect,
    });
    return mapDepartment(record);
  } catch (error) {
    handlePrismaError(error);
  }
};

const update = async (
  id: number,
  data: UpdateDepartmentData
): Promise<Department> => {
  try {
    const record = await prisma.departments.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { department_name: data.name } : {}),
      },
      select: departmentSelect,
    });
    return mapDepartment(record);
  } catch (error) {
    handlePrismaError(error);
  }
};

const deleteById = async (id: number): Promise<void> => {
  try {
    await prisma.departments.delete({ where: { id } });
  } catch (error) {
    handlePrismaError(error);
  }
};

export { findById, findWithPagination, create, update, deleteById };

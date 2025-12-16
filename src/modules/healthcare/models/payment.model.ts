import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { Prisma } from '@/generated/prisma';
import type {
  Payment,
  CreatePaymentData,
  UpdatePaymentData,
  PaymentFilterOptions,
  PaymentPaginationOptions,
  PaginatedPayments,
} from '../types';

const paymentSelect = {
  id: true,
  patient_id: true,
  facility_id: true,
  service_type: true,
  service_id: true,
  amount: true,
  currency: true,
  payment_method: true,
  insurance_coverage: true,
  patient_copay: true,
  status: true,
  payment_date: true,
  created_at: true,
} satisfies Prisma.paymentsSelect;

type PaymentRecord = Prisma.paymentsGetPayload<{
  select: typeof paymentSelect;
}>;

const mapPayment = (record: PaymentRecord): Payment => ({
  id: record.id,
  patientId: record.patient_id ?? 0,
  facilityId: record.facility_id ?? null,
  serviceType: record.service_type ?? null,
  serviceId: record.service_id ?? null,
  amount: Number(record.amount),
  currency: record.currency ?? 'THB',
  paymentMethod: record.payment_method ?? null,
  insuranceCoverage: Number(record.insurance_coverage),
  patientCopay: Number(record.patient_copay),
  status: record.status ?? null,
  paymentDate: record.payment_date ?? null,
  createdAt: record.created_at,
});

const buildWhereClause = (
  filters: PaymentFilterOptions = {}
): Prisma.paymentsWhereInput => {
  const where: Prisma.paymentsWhereInput = {};

  if (filters.patientId !== undefined) {
    where.patient_id = filters.patientId;
  }

  if (filters.facilityId !== undefined) {
    where.facility_id = filters.facilityId;
  }

  if (filters.serviceType) {
    where.service_type = {
      equals: filters.serviceType,
      mode: 'insensitive',
    };
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.paymentMethod) {
    where.payment_method = {
      equals: filters.paymentMethod,
      mode: 'insensitive',
    };
  }

  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    where.amount = {};
    if (filters.minAmount !== undefined) {
      where.amount.gte = filters.minAmount;
    }
    if (filters.maxAmount !== undefined) {
      where.amount.lte = filters.maxAmount;
    }
  }

  return where;
};

const getOrderBy = (
  sortBy: PaymentPaginationOptions['sortBy'],
  sortOrder: PaymentPaginationOptions['sortOrder']
): Prisma.paymentsOrderByWithRelationInput => {
  switch (sortBy) {
    case 'id':
      return { id: sortOrder };
    case 'paymentDate':
      return { payment_date: sortOrder };
    case 'amount':
      return { amount: sortOrder };
    case 'createdAt':
    default:
      return { created_at: sortOrder };
  }
};

const findById = async (id: number): Promise<Payment | null> => {
  try {
    const record = await prisma.payments.findUnique({
      where: { id },
      select: paymentSelect,
    });

    return record ? mapPayment(record) : null;
  } catch (error) {
    handlePrismaError(error);
  }
};

const findMany = async (
  filters: PaymentFilterOptions = {}
): Promise<Payment[]> => {
  try {
    const records = await prisma.payments.findMany({
      where: buildWhereClause(filters),
      select: paymentSelect,
      orderBy: { created_at: 'desc' },
    });

    return records.map(mapPayment);
  } catch (error) {
    handlePrismaError(error);
  }
};

const findWithPagination = async (
  filters: PaymentFilterOptions,
  pagination: PaymentPaginationOptions
): Promise<PaginatedPayments> => {
  try {
    const { page, limit, sortBy, sortOrder } = pagination;
    const where = buildWhereClause(filters);
    const orderBy = getOrderBy(sortBy, sortOrder);

    const [records, total] = await Promise.all([
      prisma.payments.findMany({
        where,
        select: paymentSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      prisma.payments.count({ where }),
    ]);

    return {
      payments: records.map(mapPayment),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const create = async (data: CreatePaymentData): Promise<Payment> => {
  try {
    const record = await prisma.payments.create({
      data: {
        patient_id: data.patientId,
        facility_id: data.facilityId ?? null,
        service_type: data.serviceType ?? null,
        service_id: data.serviceId ?? null,
        amount: data.amount ?? 0,
        currency: data.currency ?? 'THB',
        payment_method: data.paymentMethod ?? null,
        insurance_coverage: data.insuranceCoverage ?? 0,
        patient_copay: data.patientCopay ?? 0,
        status: data.status ?? null,
        payment_date: data.paymentDate ?? null,
      },
      select: paymentSelect,
    });

    return mapPayment(record);
  } catch (error) {
    handlePrismaError(error);
  }
};

const update = async (
  id: number,
  data: UpdatePaymentData
): Promise<Payment> => {
  try {
    const updateData: Prisma.paymentsUncheckedUpdateInput = {};

    if (data.patientId !== undefined) {
      updateData.patient_id = data.patientId;
    }

    if (data.facilityId !== undefined) {
      updateData.facility_id = data.facilityId ?? null;
    }

    if (data.serviceType !== undefined) {
      updateData.service_type = data.serviceType ?? null;
    }

    if (data.serviceId !== undefined) {
      updateData.service_id = data.serviceId ?? null;
    }

    if (data.amount !== undefined) {
      updateData.amount = data.amount;
    }

    if (data.currency !== undefined) {
      updateData.currency = data.currency;
    }

    if (data.paymentMethod !== undefined) {
      updateData.payment_method = data.paymentMethod ?? null;
    }

    if (data.insuranceCoverage !== undefined) {
      updateData.insurance_coverage = data.insuranceCoverage;
    }

    if (data.patientCopay !== undefined) {
      updateData.patient_copay = data.patientCopay;
    }

    if (data.status !== undefined) {
      updateData.status = data.status ?? null;
    }

    if (data.paymentDate !== undefined) {
      updateData.payment_date = data.paymentDate ?? null;
    }

    const record = await prisma.payments.update({
      where: { id },
      data: updateData,
      select: paymentSelect,
    });

    return mapPayment(record);
  } catch (error) {
    handlePrismaError(error);
  }
};

const deleteById = async (id: number): Promise<void> => {
  try {
    await prisma.payments.delete({ where: { id } });
  } catch (error) {
    handlePrismaError(error);
  }
};

export { findById, findMany, findWithPagination, create, update, deleteById };

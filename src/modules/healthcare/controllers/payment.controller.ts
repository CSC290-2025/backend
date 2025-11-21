import type { Context } from 'hono';
import { successResponse } from '@/utils/response';
import { NotFoundError, ValidationError } from '@/errors';
import type {
  CreatePaymentData,
  UpdatePaymentData,
  PaymentFilterOptions,
  PaymentPaginationOptions,
} from '../types';
import * as PaymentModel from '../models/payment.model';

const parseRequiredNumber = (value: string, fieldName: string): number => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new ValidationError(`Invalid ${fieldName}`);
  }
  return parsed;
};

const parseOptionalNumber = (value?: string): number | undefined => {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const parseFilters = (
  query: Record<string, string | undefined>
): PaymentFilterOptions => ({
  patientId: parseOptionalNumber(query.patientId),
  facilityId: parseOptionalNumber(query.facilityId),
  serviceType: query.serviceType,
  status: query.status,
  paymentMethod: query.paymentMethod,
  minAmount: parseOptionalNumber(query.minAmount),
  maxAmount: parseOptionalNumber(query.maxAmount),
});

const parsePagination = (
  query: Record<string, string | undefined>
): PaymentPaginationOptions => {
  const page = parseOptionalNumber(query.page) ?? 1;
  const limit = parseOptionalNumber(query.limit) ?? 10;

  const validSortBy: PaymentPaginationOptions['sortBy'][] = [
    'id',
    'createdAt',
    'paymentDate',
    'amount',
  ];

  const sortBy = validSortBy.includes(
    (query.sortBy ?? '') as PaymentPaginationOptions['sortBy']
  )
    ? (query.sortBy as PaymentPaginationOptions['sortBy'])
    : 'createdAt';

  const sortOrder =
    query.sortOrder === 'asc' ? ('asc' as const) : ('desc' as const);

  return {
    page,
    limit,
    sortBy,
    sortOrder,
  };
};

const getPayment = async (c: Context) => {
  const id = parseRequiredNumber(c.req.param('id'), 'payment id');
  const payment = await PaymentModel.findById(id);

  if (!payment) {
    throw new NotFoundError('Payment not found');
  }

  return successResponse(c, { payment });
};

const createPayment = async (c: Context) => {
  const payload = (await c.req.json()) as CreatePaymentData;
  const payment = await PaymentModel.create(payload);

  return successResponse(c, { payment }, 201, 'Payment created successfully');
};

const updatePayment = async (c: Context) => {
  const id = parseRequiredNumber(c.req.param('id'), 'payment id');
  const payload = (await c.req.json()) as UpdatePaymentData;

  const payment = await PaymentModel.update(id, payload);

  return successResponse(c, { payment }, 200, 'Payment updated successfully');
};

const deletePayment = async (c: Context) => {
  const id = parseRequiredNumber(c.req.param('id'), 'payment id');
  await PaymentModel.deleteById(id);

  return successResponse(c, null, 200, 'Payment deleted successfully');
};

const listPayments = async (c: Context) => {
  const rawQuery = c.req.query();
  const filters = parseFilters(rawQuery);
  const pagination = parsePagination(rawQuery);

  const payments = await PaymentModel.findWithPagination(filters, pagination);

  return successResponse(c, payments);
};

const listAllPayments = async (c: Context) => {
  const rawQuery = c.req.query();
  const filters = parseFilters(rawQuery);

  const payments = await PaymentModel.findMany(filters);

  return successResponse(c, { payments });
};

export {
  getPayment,
  createPayment,
  updatePayment,
  deletePayment,
  listPayments,
  listAllPayments,
};

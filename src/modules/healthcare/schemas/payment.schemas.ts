import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const PaymentSchema = z.object({
  id: z.number().int(),
  patientId: z.number().int(),
  facilityId: z.number().int().nullable(),
  serviceType: z.string().max(100).nullable(),
  serviceId: z.number().int().nullable(),
  amount: z.number(),
  currency: z.string().length(3),
  paymentMethod: z.string().max(50).nullable(),
  insuranceCoverage: z.number(),
  patientCopay: z.number(),
  status: z.string().max(50).nullable(),
  paymentDate: z.coerce.date().nullable(),
  createdAt: z.date(),
});

const CreatePaymentSchema = z.object({
  patientId: z.number().int(),
  facilityId: z.number().int().optional(),
  serviceType: z
    .string()
    .max(100, 'Service type must be at most 100 characters')
    .optional(),
  serviceId: z.number().int().optional(),
  amount: z.number().nonnegative('Amount must be zero or positive').default(0),
  currency: z
    .string()
    .length(3, 'Currency must be a 3-letter code')
    .default('THB'),
  paymentMethod: z
    .string()
    .max(50, 'Payment method must be at most 50 characters')
    .optional(),
  insuranceCoverage: z
    .number()
    .nonnegative('Insurance coverage must be zero or positive')
    .default(0),
  patientCopay: z
    .number()
    .nonnegative('Patient copay must be zero or positive')
    .default(0),
  status: z.string().max(50, 'Status must be at most 50 characters').optional(),
  paymentDate: z.coerce.date().optional(),
});

const UpdatePaymentSchema = z.object({
  patientId: z.number().int().optional(),
  facilityId: z.number().int().nullable().optional(),
  serviceType: z
    .string()
    .max(100, 'Service type must be at most 100 characters')
    .nullable()
    .optional(),
  serviceId: z.number().int().nullable().optional(),
  amount: z.number().nonnegative('Amount must be zero or positive').optional(),
  currency: z.string().length(3, 'Currency must be a 3-letter code').optional(),
  paymentMethod: z
    .string()
    .max(50, 'Payment method must be at most 50 characters')
    .nullable()
    .optional(),
  insuranceCoverage: z
    .number()
    .nonnegative('Insurance coverage must be zero or positive')
    .optional(),
  patientCopay: z
    .number()
    .nonnegative('Patient copay must be zero or positive')
    .optional(),
  status: z
    .string()
    .max(50, 'Status must be at most 50 characters')
    .nullable()
    .optional(),
  paymentDate: z.coerce.date().nullable().optional(),
});

const PaymentFilterSchema = z.object({
  patientId: z.coerce.number().int().optional(),
  facilityId: z.coerce.number().int().optional(),
  serviceType: z.string().optional(),
  status: z.string().optional(),
  paymentMethod: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
});

const PaymentPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z
    .enum(['id', 'createdAt', 'paymentDate', 'amount'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const PaginatedPaymentsSchema = z.object({
  payments: z.array(PaymentSchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});

const PaymentsListSchema = z.object({
  payments: z.array(PaymentSchema),
});

const PaymentIdParam = z.object({
  id: z.coerce.number().int(),
});

const getPaymentRoute = createGetRoute({
  path: '/payments/{id}',
  summary: 'Get payment by ID',
  responseSchema: PaymentSchema,
  params: PaymentIdParam,
  tags: ['Payments'],
});

const createPaymentRoute = createPostRoute({
  path: '/payments',
  summary: 'Create new payment',
  requestSchema: CreatePaymentSchema,
  responseSchema: PaymentSchema,
  tags: ['Payments'],
});

const updatePaymentRoute = createPutRoute({
  path: '/payments/{id}',
  summary: 'Update payment',
  requestSchema: UpdatePaymentSchema,
  responseSchema: PaymentSchema,
  params: PaymentIdParam,
  tags: ['Payments'],
});

const deletePaymentRoute = createDeleteRoute({
  path: '/payments/{id}',
  summary: 'Delete payment',
  params: PaymentIdParam,
  tags: ['Payments'],
});

const listPaymentsRoute = createGetRoute({
  path: '/payments',
  summary: 'List payments with pagination and filters',
  responseSchema: PaginatedPaymentsSchema,
  query: z.object({
    ...PaymentFilterSchema.shape,
    ...PaymentPaginationSchema.shape,
  }),
  tags: ['Payments'],
});

export const PaymentSchemas = {
  PaymentSchema,
  CreatePaymentSchema,
  UpdatePaymentSchema,
  PaymentFilterSchema,
  PaymentPaginationSchema,
  PaginatedPaymentsSchema,
  PaymentsListSchema,
  PaymentIdParam,
  getPaymentRoute,
  createPaymentRoute,
  updatePaymentRoute,
  deletePaymentRoute,
  listPaymentsRoute,
};

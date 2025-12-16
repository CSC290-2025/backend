import type { z } from 'zod';
import type { PaymentSchemas } from '../schemas';

type Payment = z.infer<typeof PaymentSchemas.PaymentSchema>;
type CreatePaymentData = z.infer<typeof PaymentSchemas.CreatePaymentSchema>;
type UpdatePaymentData = z.infer<typeof PaymentSchemas.UpdatePaymentSchema>;
type PaymentFilterOptions = z.infer<typeof PaymentSchemas.PaymentFilterSchema>;
type PaymentPaginationOptions = z.infer<
  typeof PaymentSchemas.PaymentPaginationSchema
>;
type PaginatedPayments = z.infer<typeof PaymentSchemas.PaginatedPaymentsSchema>;

export type {
  Payment,
  CreatePaymentData,
  UpdatePaymentData,
  PaymentFilterOptions,
  PaymentPaginationOptions,
  PaginatedPayments,
};

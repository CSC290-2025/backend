import type { z } from 'zod';
import type { InsuranceCardSchemas } from '../schemas';

type InsuranceCard = z.infer<typeof InsuranceCardSchemas.InsuranceCardSchema>;
type CreateInsuranceCardData = z.infer<
  typeof InsuranceCardSchemas.CreateInsuranceCardSchema
>;
type TopUpInsuranceCardData = z.infer<
  typeof InsuranceCardSchemas.TopUpInsuranceCardSchema
>;

export type {
  InsuranceCard,
  CreateInsuranceCardData,
  TopUpInsuranceCardData,
};

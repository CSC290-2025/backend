import type { z } from 'zod';
import type { InsuranceCardSchemas } from '../schemas';

type InsuranceCard = z.infer<typeof InsuranceCardSchemas.InsuranceCardSchema>;
type CreateInsuranceCardData = z.infer<
  typeof InsuranceCardSchemas.CreateInsuranceCardSchema
>;
type TopUpInsuranceCardData = z.infer<
  typeof InsuranceCardSchemas.TopUpInsuranceCardSchema
>;
type UpdateInsuranceCardData = z.infer<
  typeof InsuranceCardSchemas.UpdateInsuranceCardSchema
>;
type GetInsuranceCardResponse = z.infer<
  typeof InsuranceCardSchemas.GetInsuranceCardResponseSchema
>;
type GetInsuranceCardsResponse = z.infer<
  typeof InsuranceCardSchemas.GetInsuranceCardsResponseSchema
>;
type CreateInsuranceCardResponse = z.infer<
  typeof InsuranceCardSchemas.CreateInsuranceCardResponseSchema
>;
type TopUpInsuranceCardResponse = z.infer<
  typeof InsuranceCardSchemas.TopUpInsuranceCardResponseSchema
>;
type UpdateInsuranceCardResponse = z.infer<
  typeof InsuranceCardSchemas.UpdateInsuranceCardResponseSchema
>;

export type {
  InsuranceCard,
  CreateInsuranceCardData,
  TopUpInsuranceCardData,
  UpdateInsuranceCardData,
  GetInsuranceCardResponse,
  GetInsuranceCardsResponse,
  CreateInsuranceCardResponse,
  TopUpInsuranceCardResponse,
  UpdateInsuranceCardResponse,
};

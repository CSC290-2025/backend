import type { z } from 'zod';
import type { FreecycleReceiverRequestSchemas } from '../schemas';

type RequestStatus = z.infer<
  typeof FreecycleReceiverRequestSchemas.RequestStatusEnum
>;
type ReceiverRequest = z.infer<
  typeof FreecycleReceiverRequestSchemas.ReceiverRequestSchema
>;
type CreateReceiverRequestData = z.infer<
  typeof FreecycleReceiverRequestSchemas.CreateReceiverRequestSchema
>;
type UpdateReceiverRequestData = z.infer<
  typeof FreecycleReceiverRequestSchemas.UpdateReceiverRequestSchema
>;

export type {
  RequestStatus,
  ReceiverRequest,
  CreateReceiverRequestData,
  UpdateReceiverRequestData,
};

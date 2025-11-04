import type { z } from 'zod';
import type { ScbSchemas } from '../schemas';

type ScbToken = z.infer<typeof ScbSchemas.ScbTokenSchema>;
type ScbQrRequestSchema = z.infer<typeof ScbSchemas.ScbQrRequestSchema>;
type ScbQrResponseSchema = z.infer<typeof ScbSchemas.ScbQrResponseSchema>;
type ScbWebhookPayload = z.infer<typeof ScbSchemas.ScbWebhookPayloadSchema>;
type ScbQrConfirmResponse = z.infer<
  typeof ScbSchemas.ScbQrConfirmResponseSchema
>;

type ScbApiQrRequest = {
  qrType: string;
  ppType: string;
  ppId: string;
  amount: string;
  ref1: string;
  ref2: string;
  ref3: string;
};

export type {
  ScbToken,
  ScbQrRequestSchema,
  ScbQrResponseSchema,
  ScbWebhookPayload,
  ScbQrConfirmResponse,
  ScbApiQrRequest,
};

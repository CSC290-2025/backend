import type { z } from 'zod';
import type { ScbSchemas } from '../schemas';

type ScbToken = z.infer<typeof ScbSchemas.ScbTokenSchema>;
type ScbQrRequestSchema = z.infer<typeof ScbSchemas.ScbQrRequestSchema>;
type ScbQrResponseSchema = z.infer<typeof ScbSchemas.ScbQrApiResponseSchema>;
type ScbQrCreateRequest = z.infer<typeof ScbSchemas.ScbQrCreateRequestSchema>;
type ScbQrCreateResponse = z.infer<typeof ScbSchemas.ScbQrCreateResponseSchema>;
type ScbVerifyScbRequest = z.infer<typeof ScbSchemas.ScbVerifyScbRequestSchema>;
type ScbVerifyScbResponse = z.infer<
  typeof ScbSchemas.ScbVerifyScbResponseSchema
>;
type ScbOAuthResponse = z.infer<typeof ScbSchemas.ScbOAuthResponseSchema>;

export type {
  ScbToken,
  ScbQrRequestSchema,
  ScbQrResponseSchema,
  ScbQrCreateRequest,
  ScbQrCreateResponse,
  ScbVerifyScbRequest,
  ScbVerifyScbResponse,
  ScbOAuthResponse,
};

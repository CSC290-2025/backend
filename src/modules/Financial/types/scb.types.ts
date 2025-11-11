import type { z } from 'zod';
import type { ScbSchemas } from '../schemas';

type ScbToken = z.infer<typeof ScbSchemas.ScbTokenSchema>;
type ScbQrRequestSchema = z.infer<typeof ScbSchemas.ScbQrRequestSchema>;
type ScbQrResponseSchema = z.infer<typeof ScbSchemas.ScbQrResponseSchema>;

export type { ScbToken, ScbQrRequestSchema, ScbQrResponseSchema };

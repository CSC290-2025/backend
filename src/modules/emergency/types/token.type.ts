import type { TokenFcmSchemas } from '@/modules/emergency/schemas';
import type * as z from 'zod';

type TokenFcmResponse = z.infer<typeof TokenFcmSchemas.TokenFcmResponseSchema>;
type CreateTokenFcm = z.infer<typeof TokenFcmSchemas.CreateTokenFcmSchema>;

export type { TokenFcmResponse, CreateTokenFcm };

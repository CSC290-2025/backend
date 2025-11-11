import { z } from 'zod';

// accessToken = The OAuth access token issued by SCB
// tokenType = The type of the token issued "Bearer"
const ScbTokenSchema = z.object({
  accessToken: z.string(),
  tokenType: z.string(),
  expiresIn: z.number(),
  expiresAt: z.number(),
});

export const ScbSchemas = {
  ScbTokenSchema,
};

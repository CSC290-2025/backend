import type { z } from 'zod';
import type { ScbSchemas } from '../schemas';

type ScbToken = z.infer<typeof ScbSchemas.ScbTokenSchema>;

export type { ScbToken };

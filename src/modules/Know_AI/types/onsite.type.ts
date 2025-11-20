import type { z } from 'zod';
import type { onsiteSchemas } from '@/modules/Know_AI/schemas';

type onsite = z.infer<typeof onsiteSchemas.onsiteSchema>;
type createOnsite = z.infer<typeof onsiteSchemas.createOnsiteSchema>;

export type { onsite, createOnsite };

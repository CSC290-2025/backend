import type { z } from 'zod';
import type { MetroCardSchemas } from '../schemas/metroCard.schemas';

type MetroCard = z.infer<typeof MetroCardSchemas.MetroCardSchema>;
type CreateMetroCardData = z.infer<
  typeof MetroCardSchemas.CreateMetroCardSchema
>;

export type { MetroCard, CreateMetroCardData };

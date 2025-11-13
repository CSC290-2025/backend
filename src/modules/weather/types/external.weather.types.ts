import type { z } from 'zod';
import type { ExternalWeatherSchemas } from '../schemas';

type ExternalRawFull = z.infer<
  typeof ExternalWeatherSchemas.ExternalRawFullSchema
>;
type ExternalRawDailyOnly = z.infer<
  typeof ExternalWeatherSchemas.ExternalRawDailyOnlySchema
>;
type ExternalWeatherDTO = z.infer<
  typeof ExternalWeatherSchemas.ExternalWeatherDTOSchema
>;
type ExternalWeatherQuery = z.infer<
  typeof ExternalWeatherSchemas.ExternalWeatherQuerySchema
>;
type ImportDailyBody = z.infer<
  typeof ExternalWeatherSchemas.ImportDailyBodySchema
>;

export type {
  ExternalRawFull,
  ExternalRawDailyOnly,
  ExternalWeatherDTO,
  ExternalWeatherQuery,
  ImportDailyBody,
};

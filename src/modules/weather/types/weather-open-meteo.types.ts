import type { z } from 'zod';
import type { WeatherOpenMeteoSchemas } from '../schemas';

type ExternalRawFull = z.infer<
  typeof WeatherOpenMeteoSchemas.ExternalRawFullSchema
>;
type ExternalRawDailyOnly = z.infer<
  typeof WeatherOpenMeteoSchemas.ExternalRawDailyOnlySchema
>;
type ExternalWeatherDTO = z.infer<
  typeof WeatherOpenMeteoSchemas.ExternalWeatherDTOSchema
>;
type ExternalWeatherQuery = z.infer<
  typeof WeatherOpenMeteoSchemas.ExternalWeatherQuerySchema
>;
type ImportDailyBody = z.infer<
  typeof WeatherOpenMeteoSchemas.ImportDailyBodySchema
>;

export type {
  ExternalRawFull,
  ExternalRawDailyOnly,
  ExternalWeatherDTO,
  ExternalWeatherQuery,
  ImportDailyBody,
};

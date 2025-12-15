import type { z } from 'zod';
import type { WeatherOpenMeteoSchemas } from '../schemas';

type ExternalRawFull = z.infer<
  typeof WeatherOpenMeteoSchemas.ExternalRawFullSchema
>;
type ExternalRawDailyOnly = z.infer<
  typeof WeatherOpenMeteoSchemas.ExternalRawDailyOnlySchema
>;
type ExternalRainWindow = z.infer<
  typeof WeatherOpenMeteoSchemas.ExternalRainWindowSchema
>;
type ExternalWeatherDTO = z.infer<
  typeof WeatherOpenMeteoSchemas.ExternalWeatherDTOSchema
>;
type ExternalWeatherQuery = z.infer<
  typeof WeatherOpenMeteoSchemas.ExternalWeatherQuerySchema
>;
type RainDailyQuery = z.infer<
  typeof WeatherOpenMeteoSchemas.RainDailyQuerySchema
>;
type RainHourlyQuery = z.infer<
  typeof WeatherOpenMeteoSchemas.RainHourlyQuerySchema
>;
type ImportDailyBody = z.infer<
  typeof WeatherOpenMeteoSchemas.ImportDailyBodySchema
>;

export type {
  ExternalRawFull,
  ExternalRawDailyOnly,
  ExternalRainWindow,
  ExternalWeatherDTO,
  ExternalWeatherQuery,
  RainDailyQuery,
  RainHourlyQuery,
  ImportDailyBody,
};

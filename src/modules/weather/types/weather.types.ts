import type { z } from 'zod';
import type { WeatherSchemas } from '../schemas';

type WeatherData = z.infer<typeof WeatherSchemas.WeatherDataSchema>;
type CreateWeatherData = z.infer<typeof WeatherSchemas.CreateWeatherDataSchema>;
type UpdateWeatherData = z.infer<typeof WeatherSchemas.UpdateWeatherDataSchema>;
type WeatherDataList = z.infer<typeof WeatherSchemas.WeatherDataListSchema>;
type WeatherIdParam = z.infer<typeof WeatherSchemas.WeatherIdParam>;

export type {
  WeatherData,
  CreateWeatherData,
  UpdateWeatherData,
  WeatherDataList,
  WeatherIdParam,
};

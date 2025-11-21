import type { z } from 'zod';
import type { WeatherSchemas } from '../schemas';

type WeatherData = z.infer<typeof WeatherSchemas.WeatherDataSchema>;
type WeatherDataList = z.infer<typeof WeatherSchemas.WeatherDataListSchema>;

export type { WeatherData, WeatherDataList };

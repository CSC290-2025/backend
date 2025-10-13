import { ETLModel } from '../models';
import type { ExtractedData, FactWeather, DimLocation } from '../types';
import { NotFoundError, ValidationError } from '@/errors';

const getExtractedData = async (): Promise<ExtractedData> => {
  const data = await ETLModel.extractAllData();
  if (!data) throw new NotFoundError('No data found');
  return data;
};

const transformWeatherData = async ({
  airQuality,
  weatherData,
}: ExtractedData): Promise<{
  dimLocations: DimLocation[];
  factWeather: FactWeather[];
}> => {
  if (
    !weatherData ||
    !airQuality ||
    weatherData.length === 0 ||
    airQuality.length === 0
  ) {
    throw new ValidationError('No weather data available for transformation');
  }

  // Build dim location entries from unique location_ids in airQuality and weatherData
  const dimLocationMap: Record<number, DimLocation> = {};
  const airQualityByLocation: Record<number, typeof airQuality> = {}; // to aggregate airQuality entries by location_id

  airQuality.forEach((entry) => {
    const locId = Number(entry.location_id);
    // Ensure airQuality locations are included
    if (!dimLocationMap[locId]) {
      dimLocationMap[locId] = {
        id: locId,
        district: '',
        coordinates: null as unknown as Geolocation,
      };
    }
    // Aggregate airQuality entries by location_id
    if (!airQualityByLocation[locId]) airQualityByLocation[locId] = [] as any;
    airQualityByLocation[locId].push(entry);
  });

  // Ensure weatherData locations are included
  weatherData.forEach((entry) => {
    const locId = Number(entry.location_id);
    if (!dimLocationMap[locId]) {
      dimLocationMap[locId] = {
        id: locId,
        district: '',
        coordinates: null as unknown as Geolocation,
      };
    }
  });

  const dimLocations = Object.values(dimLocationMap).sort(
    (a, b) => a.id - b.id
  );

  // Build fact weather rows by joining weatherData with aggregated airQuality per location
  // Simplistically compute avg aqi and max pm25 per location using airQuality entries with same location_id

  const factWeather: FactWeather[] = weatherData
    .map((wd) => {
      const locId = Number(wd.location_id);
      const aqiEntries = airQualityByLocation[locId] || [];

      // parse numeric values (source DB stores numbers as strings in sample payload)
      const aqiValues = aqiEntries
        .map((a) => Number(a.aqi))
        .filter((n) => !Number.isNaN(n));
      const pm25Values = aqiEntries
        .map((a) => Number(a.pm25))
        .filter((n) => !Number.isNaN(n));

      const avgAqi =
        aqiValues.length > 0
          ? aqiValues.reduce((s, v) => s + v, 0) / aqiValues.length
          : null;
      const maxPm25 = pm25Values.length > 0 ? Math.max(...pm25Values) : null;

      const avgTemp = Number(wd.temperature);

      const record: FactWeather = {
        id: Number(wd.id),
        timeId: (wd as any).time_id ?? null,
        locationId: locId,
        avgAqi: avgAqi ?? 0,
        maxPm25: maxPm25 ?? 0,
        avgTemperatureC: Number.isNaN(avgTemp) ? 0 : avgTemp,
      };

      return record;
    })
    .sort((a, b) => a.id - b.id);

  return { dimLocations, factWeather };
};

export { getExtractedData, transformWeatherData };

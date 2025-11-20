//เกี่ยวกับ database
import type { Context } from 'hono';
import * as WeatherService from '../services/weather.service';
import { WeatherSchemas } from '../schemas';
import { successResponse } from '@/utils/response';

// ดึงข้อมูล weather ทั้งหมดจากฐานข้อมูล (ล่าสุดมาก่อน),// Fetch all weather data from the database (most recent first)
const listWeather = async (c: Context) => {
  const data = await WeatherService.listWeather();
  return successResponse(c, { data });
};

// ดึงข้อมูล weather ที่ถูกสร้างในวันที่ระบุ ,// Fetch weather data created on the specified date
const getWeatherByDate = async (c: Context) => {
  const { date } = WeatherSchemas.WeatherDateParam.parse(c.req.param());
  const data = await WeatherService.getWeatherByDate(date);
  return successResponse(c, { data });
};

// ดึงข้อมูล weather ตามช่วงวันจาก query `from` และ `to` ,// Fetch weather data by date range from `from` and `to` query
const listWeatherByDateRange = async (c: Context) => {
  const { from, to } = WeatherSchemas.WeatherDateRangeQuery.parse(
    c.req.query()
  );
  const data = await WeatherService.listWeatherByDateRange(from, to);
  return successResponse(c, { data });
};

// ดึงข้อมูล weather ของ location เฉพาะจาก path param, // Fetch weather data for a specific location from path param
const getWeatherByLocation = async (c: Context) => {
  const { location_id } = WeatherSchemas.WeatherLocationParam.parse(
    c.req.param()
  );
  const data = await WeatherService.listWeatherByLocation(location_id);
  return successResponse(c, { data });
};

// ลบข้อมูล weather ของวันที่ระบุ พร้อมบอกจำนวนแถวที่ถูกลบ, // Delete weather data for the specified date and report the number of rows deleted
const deleteWeatherByDate = async (c: Context) => {
  const { date } = WeatherSchemas.WeatherDateParam.parse(c.req.param());
  const result = await WeatherService.deleteWeatherByDate(date);
  return successResponse(
    c,
    result,
    200,
    `Deleted ${result.deleted} weather records for ${date}`
  );
};

// ลบข้อมูล weather ทั้งหมดในตาราง, // Delete all weather data in the table
const deleteAllWeather = async (c: Context) => {
  const result = await WeatherService.deleteAllWeather();
  return successResponse(
    c,
    result,
    200,
    `Deleted ${result.deleted} weather records`
  );
};

export {
  listWeather,
  getWeatherByDate,
  listWeatherByDateRange,
  getWeatherByLocation,
  deleteWeatherByDate,
  deleteAllWeather,
};

//เกี่ยวกับ open-meteo (api นอก) , About open-meteo (external api)
import type { Context } from 'hono';
import { OpenMeteoService, OpenMeteoScheduler } from '../services';
import { successResponse } from '@/utils/response';
import type { ExternalWeatherQuery, ImportDailyBody } from '../types';

// proxy คำขอ current weather ไปยัง Open-Meteo, Proxy current weather requests to Open-Meteo
const getOpenMeteoCurrent = async (c: Context) => {
  const data = await OpenMeteoService.getCurrentFromOpenMeteo(
    c.req.query() as unknown as ExternalWeatherQuery
  );
  return successResponse(c, data);
};

// ดึงข้อมูลพยากรณ์รายชั่วโมงตาม query ที่ client ส่งมา ,// Retrieve hourly forecast data based on client-sent queries.
const getOpenMeteoHourly = async (c: Context) => {
  const data = await OpenMeteoService.getHourlyFromOpenMeteo(
    c.req.query() as unknown as ExternalWeatherQuery
  );
  return successResponse(c, data);
};

// ดึงข้อมูลพยากรณ์รายวันจาก Open-Meteo ,// Retrieve daily forecast data from Open-Meteo
const getOpenMeteoDaily = async (c: Context) => {
  const data = await OpenMeteoService.getDailyFromOpenMeteo(
    c.req.query() as unknown as ExternalWeatherQuery
  );
  return successResponse(c, data);
};

// import ข้อมูลรายวันของเมื่อวานสำหรับ location เดียว,// Import yesterday's daily data for a single location
const importDailyOpenMeteo = async (c: Context) => {
  const body = await c.req.json();
  const result = await OpenMeteoScheduler.importYesterdayToDatabase(
    body as ImportDailyBody
  );
  return successResponse(c, result, 201, `Imported daily for ${result.date}`);
};

// import ข้อมูลเมื่อวานให้ทุก location ที่มีในระบบ,// Import yesterday's data for all locations in the system
const importDailyOpenMeteoAll = async (c: Context) => {
  const result = await OpenMeteoScheduler.importAllLocationsYesterday();
  return successResponse(
    c,
    result,
    201,
    `Imported daily for ${result.processed} locations`
  );
};

export {
  getOpenMeteoCurrent,
  getOpenMeteoHourly,
  getOpenMeteoDaily,
  importDailyOpenMeteo,
  importDailyOpenMeteoAll,
};

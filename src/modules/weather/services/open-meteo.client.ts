// client สำหรับเรียก Open-Meteo (api ภายนอก) , // Client for calling Open-Meteo (external API)
const API_BASE = 'https://api.open-meteo.com/v1';

export const OPEN_METEO_TIMEZONE = 'Asia/Bangkok';

// เรียก fetch และตัด timeout เองเพื่อกัน request ค้าง, // Custom fetch with timeout to prevent hanging requests
const fetchJson = async (url: string, init?: RequestInit, timeoutMs = 8000) => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Open-Meteo ${res.status}: ${text}`);
    }
    return await res.json();
  } finally {
    clearTimeout(t);
  }
};

export const OpenMeteoClient = {
  async getFull(lat: number, lon: number, timezone = OPEN_METEO_TIMEZONE) {
    // ดึง current/hourly/daily แบบชุดใหญ่ในคำขอเดียว , // Fetch full current/hourly/daily data in a single request
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      timezone,
      current: [
        'temperature_2m',
        'apparent_temperature',
        'weather_code',
        'relative_humidity_2m',
        'wind_speed_10m',
        'wind_direction_10m',
        'surface_pressure',
      ].join(','),
      hourly: [
        'temperature_2m',
        'precipitation_probability',
        'weather_code',
      ].join(','),
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'weather_code',
        'precipitation_probability_max',
      ].join(','),
    });
    return fetchJson(`${API_BASE}/forecast?${params.toString()}`);
  },

  async getDailyPastOne(
    lat: number,
    lon: number,
    timezone = OPEN_METEO_TIMEZONE
  ) {
    // ใช้สำหรับดึงข้อมูลย้อนหลัง 1 วัน (ไว้ import ลงฐานข้อมูล) , // Used to fetch past 1-day data (for database import)
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      timezone,
      past_days: '1',
      forecast_days: '1',
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'weather_code',
        'precipitation_probability_max',
        'apparent_temperature_max',
        'apparent_temperature_min',
        'wind_speed_10m_max',
        'wind_direction_10m_dominant',
        'precipitation_hours',
      ].join(','),
    });
    return fetchJson(`${API_BASE}/forecast?${params.toString()}`);
  },
};

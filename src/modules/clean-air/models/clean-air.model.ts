import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { AirQualityCategory } from '../types';

type PrismaAirQualityCategory = 'good' | 'moderate' | 'unhealthy' | 'hazardous';

const AIR_QUALITY_CATEGORY_MAP: Record<
  AirQualityCategory,
  PrismaAirQualityCategory
> = {
  GOOD: 'good',
  MODERATE: 'moderate',
  UNHEALTHY_FOR_SENSITIVE: 'unhealthy',
  UNHEALTHY: 'unhealthy',
  VERY_UNHEALTHY: 'hazardous',
  HAZARDOUS: 'hazardous',
};

const BANGKOK_PROVINCE = 'Bangkok';

const findBangkokDistrictAddress = async (district: string) => {
  try {
    return await prisma.addresses.findFirst({
      where: {
        province: { equals: BANGKOK_PROVINCE, mode: 'insensitive' },
        district: { equals: district, mode: 'insensitive' },
      },
      select: { id: true },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const createBangkokDistrictAddress = async (district: string) => {
  try {
    return await prisma.addresses.create({
      data: {
        province: BANGKOK_PROVINCE,
        district,
      },
      select: { id: true },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

export const hasAirQualityRecord = async ({
  locationId,
  measuredAt,
}: {
  locationId: number;
  measuredAt: string;
}) =>
  Boolean(
    await prisma.air_quality.findFirst({
      where: { location_id: locationId, measured_at: new Date(measuredAt) },
      select: { id: true },
    })
  );

export const ensureBangkokDistrictAddress = async (
  district: string
): Promise<number> => {
  const trimmedDistrict = district.trim();
  const existing = await findBangkokDistrictAddress(trimmedDistrict);
  if (existing?.id) {
    return existing.id;
  }

  const created = await createBangkokDistrictAddress(trimmedDistrict);
  if (!created?.id) {
    throw new Error(`Failed to create address for district ${district}`);
  }
  return created.id;
};

interface CreateAirQualityRecordParams {
  locationId: number;
  pm25: number;
  aqi: number;
  category: AirQualityCategory;
  measuredAt: string;
}

export const createAirQualityRecord = async ({
  locationId,
  pm25,
  aqi,
  category,
  measuredAt,
}: CreateAirQualityRecordParams) => {
  const prismaCategory = AIR_QUALITY_CATEGORY_MAP[category] ?? 'good';

  try {
    return await prisma.air_quality.create({
      data: {
        location_id: locationId,
        pm25,
        aqi,
        category: prismaCategory,
        measured_at: new Date(measuredAt),
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

export const hasAlertSentToday = async (district: string): Promise<boolean> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAlert = await prisma.alerts.findFirst({
      where: {
        message: {
          contains: `Air quality alert: ${district}`,
        },
        sent_at: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    return !!existingAlert;
  } catch (error) {
    handlePrismaError(error);
    return false;
  }
};

export const createAirQualityAlerts = async (
  district: string,
  aqi: number,
  category: string,
  userIds: number[]
): Promise<void> => {
  try {
    const message = `Air quality alert: ${district} - AQI ${aqi} (${category}). Stay safe and reduce exposure.`;

    await prisma.alerts.createMany({
      data: userIds.map((userId) => ({
        user_id: userId,
        message,
        status: 'sent',
      })),
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

export const hasVolunteerEventRecently = async (
  eventTitle: string,
  days: number = 30
): Promise<boolean> => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const existingEvent = await prisma.volunteer_events.findFirst({
      where: {
        title: eventTitle,
        created_at: {
          gte: cutoffDate,
        },
      },
    });

    return !!existingEvent;
  } catch (error) {
    handlePrismaError(error);
    return false;
  }
};

export const CleanAirModel = {
  ensureBangkokDistrictAddress,
  createAirQualityRecord,
  hasAirQualityRecord,
  hasAlertSentToday,
  createAirQualityAlerts,
  hasVolunteerEventRecently,
};

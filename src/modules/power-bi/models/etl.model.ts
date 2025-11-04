import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';

import type {
  ExtractedHealthcareData,
  ExtractedUserData,
  ExtractedWasteData,
  ExtractedWeatherData,
} from '../types';

const extractUserData = async (): Promise<ExtractedUserData> => {
  try {
    const [
      roles,
      departments,
      specialties,
      addresses,
      usersSpecialities,
      users,
      userProfiles,
      usersDepartments,
    ] = await Promise.all([
      prisma.roles.findMany(),
      prisma.departments.findMany(),
      prisma.specialty.findMany(),
      prisma.addresses.findMany(),
      prisma.users_specialty.findMany(),
      prisma.users.findMany(),
      prisma.user_profiles.findMany(),
      prisma.users_departments.findMany(),
    ]);

    return {
      roles,
      departments,
      specialties,
      addresses,
      usersSpecialities,
      users,
      userProfiles,
      usersDepartments,
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const extractHealthcareData = async (): Promise<ExtractedHealthcareData> => {
  try {
    const [
      patients,
      facilities,
      beds,
      appointments,
      prescriptions,
      ambulances,
      emergencyCalls,
      payments,
      teamIntegrations,
    ] = await Promise.all([
      prisma.patients.findMany(),
      prisma.facilities.findMany(),
      prisma.beds.findMany(),
      prisma.appointments.findMany(),
      prisma.prescriptions.findMany(),
      prisma.ambulances.findMany(),
      prisma.emergency_calls.findMany(),
      prisma.payments.findMany(),
      prisma.team_integrations.findMany(),
    ]);

    return {
      patients,
      facilities,
      beds,
      appointments,
      prescriptions,
      ambulances,
      emergencyCalls,
      payments,
      teamIntegrations,
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const extractAddressesForHealthcare = async () => {
  try {
    return await prisma.addresses.findMany();
  } catch (error) {
    handlePrismaError(error);
  }
};

const extractWeatherData = async (): Promise<ExtractedWeatherData> => {
  try {
    const [airQuality, weatherData] = await Promise.all([
      prisma.air_quality.findMany(),
      prisma.weather_data.findMany(),
    ]);

    return {
      airQuality,
      weatherData,
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const extractWasteData = async (): Promise<ExtractedWasteData> => {
  try {
    const [wasteTypes, wasteEventStatistics, powerBiReports] =
      await Promise.all([
        prisma.waste_types.findMany(),
        prisma.waste_event_statistics.findMany(),
        prisma.power_bi_reports.findMany(),
      ]);

    return {
      wasteTypes,
      wasteEventStatistics,
      powerBiReports,
    };
  } catch (error) {
    handlePrismaError(error);
    throw error;
  }
};

// Generic reports metadata across categories (admin-owned)
const extractReportsMetadata = async () => {
  try {
    // Shape is flexible; frontend maps embed_url or embedUrl if present
    // and filters by category string
    return await prisma.reports_metadata.findMany();
  } catch (error) {
    handlePrismaError(error);
  }
};

const createReportMetadata = async (record: {
  title: string;
  description?: string | null;
  category: string;
  embed_url?: string | null;
  embedUrl?: string | null;
}) => {
  try {
    // Normalizes both embed_url and embedUrl
    const payload: any = {
      title: record.title,
      description: record.description ?? null,
      category: record.category,
      embed_url: (record as any).embed_url ?? (record as any).embedUrl ?? null,
    };
    return await prisma.reports_metadata.create({ data: payload });
  } catch (error) {
    handlePrismaError(error);
  }
};

export {
  extractUserData,
  extractHealthcareData,
  extractWeatherData,
  extractWasteData,
  extractAddressesForHealthcare,
  extractReportsMetadata,
  createReportMetadata,
};

import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';

import type { ExtractedData } from '../types';

const extractAllData = async (): Promise<ExtractedData> => {
  try {
    const [
      roles,
      departments,
      specialties,
      addresses,
      users,
      userProfiles,
      usersDepartments,
      airQuality,
      weatherData,
      patients,
      facilities,
      beds,
      appointments,
      prescriptions,
      ambulances,
      emergencyCalls,
      payments,
      teamIntegrations,
      wasteTypes,
      wasteEventStatistics,
      powerBiReports,
    ] = await Promise.all([
      prisma.roles.findMany(),
      prisma.departments.findMany(),
      prisma.specialty.findMany(),
      prisma.addresses.findMany(),
      prisma.users.findMany(),
      prisma.user_profiles.findMany(),
      prisma.users_departments.findMany(),
      prisma.air_quality.findMany(),
      prisma.weather_data.findMany(),
      prisma.patients.findMany(),
      prisma.facilities.findMany(),
      prisma.beds.findMany(),
      prisma.appointments.findMany(),
      prisma.prescriptions.findMany(),
      prisma.ambulances.findMany(),
      prisma.emergency_calls.findMany(),
      prisma.payments.findMany(),
      prisma.team_integrations.findMany(),
      prisma.waste_types.findMany(),
      prisma.waste_event_statistics.findMany(),
      prisma.power_bi_reports.findMany(),
    ]);

    return {
      roles,
      departments,
      specialties,
      addresses,
      users,
      userProfiles,
      usersDepartments,
      airQuality,
      weatherData,
      patients,
      facilities,
      beds,
      appointments,
      prescriptions,
      ambulances,
      emergencyCalls,
      payments,
      teamIntegrations,
      wasteTypes,
      wasteEventStatistics,
      powerBiReports,
    };
  } catch (error) {
    handlePrismaError(error);
    throw error;
  }
};

export { extractAllData };

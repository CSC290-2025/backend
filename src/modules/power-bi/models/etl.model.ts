import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';

import type {
  ExtractedHealthcareData,
  ExtractedUserData,
  ExtractedWasteData,
  ExtractedWeatherData,
} from '../types';

<<<<<<< HEAD
const extractUserData = async (): Promise<ExtractedUserData> => {
=======
const extractUserData = async () => {
>>>>>>> ddf9188 (feat: implement modular ETL data extraction and fix Firebase field mapping)
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
    throw error;
  }
};

<<<<<<< HEAD
const extractHealthcareData = async (): Promise<ExtractedHealthcareData> => {
=======
const extractHealthcareData = async () => {
>>>>>>> ddf9188 (feat: implement modular ETL data extraction and fix Firebase field mapping)
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
    throw error;
  }
};

<<<<<<< HEAD
const extractWeatherData = async (): Promise<ExtractedWeatherData> => {
=======
const extractWeatherData = async () => {
>>>>>>> ddf9188 (feat: implement modular ETL data extraction and fix Firebase field mapping)
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
    throw error;
  }
};

<<<<<<< HEAD
const extractWasteData = async (): Promise<ExtractedWasteData> => {
=======
const extractWasteData = async () => {
>>>>>>> ddf9188 (feat: implement modular ETL data extraction and fix Firebase field mapping)
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

export {
<<<<<<< HEAD
=======
  extractAllData,
>>>>>>> ddf9188 (feat: implement modular ETL data extraction and fix Firebase field mapping)
  extractUserData,
  extractHealthcareData,
  extractWeatherData,
  extractWasteData,
};

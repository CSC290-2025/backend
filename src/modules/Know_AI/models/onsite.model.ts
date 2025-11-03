import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { onsite, createOnsite } from '@/modules/Know_AI/types';
import type { onsite_sessions } from '@/generated/prisma';
import { Decimal } from '@prisma/client/runtime/library';

const formatOnSiteSession = (result: onsite_sessions): onsite => {
  return {
    ...result,
    duration_hours:
      result.duration_hours instanceof Decimal
        ? (result.duration_hours.toNumber() as number | null)
        : (result.duration_hours as number | null),
  };
};

const getAllOnsiteSession = async (): Promise<onsite[]> => {
  try {
    const data = await prisma.onsite_sessions.findMany({
      orderBy: {
        event_at: 'desc',
      },
    });
    return data.map(formatOnSiteSession);
  } catch (error) {
    handlePrismaError(error);
  }
};

const getOnsiteSessionById = async (id: number): Promise<onsite> => {
  try {
    const data = await prisma.onsite_sessions.findUniqueOrThrow({
      where: {
        id,
      },
    });
    return formatOnSiteSession(data);
  } catch (error) {
    handlePrismaError(error);
  }
};

const createOnsiteSession = async (data: createOnsite): Promise<onsite> => {
  try {
    const result = await prisma.onsite_sessions.create({ data });
    return formatOnSiteSession(result);
  } catch (error) {
    handlePrismaError(error);
  }
};

const deleteOnsiteSession = async (id: number): Promise<onsite> => {
  try {
    const result = await prisma.onsite_sessions.delete({
      where: {
        id,
      },
    });
    return formatOnSiteSession(result);
  } catch (error) {
    handlePrismaError(error);
  }
};

export {
  getAllOnsiteSession,
  getOnsiteSessionById,
  createOnsiteSession,
  deleteOnsiteSession,
};

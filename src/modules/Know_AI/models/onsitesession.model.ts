import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type {
  OnsiteSession,
  CreateOnsiteSession,
} from '@/modules/Know_AI/types';
import type { onsite_sessions } from '@/generated/prisma';
import { Decimal } from '@prisma/client/runtime/library';

const formatOnSiteSession = (result: onsite_sessions): OnsiteSession => {
  return {
    ...result,
    duration_hours:
      result.duration_hours instanceof Decimal
        ? (result.duration_hours.toNumber() as number | null)
        : (result.duration_hours as number | null),
  };
};

const createOnsiteSession = async (
  data: CreateOnsiteSession,
  tx?: any
): Promise<OnsiteSession> => {
  try {
    const prismaClient = tx || prisma;
    const result = await prismaClient.onsite_sessions.create({ data });
    return formatOnSiteSession(result);
  } catch (error) {
    handlePrismaError(error);
  }
};

const createMultipleOnsiteSessions = async (
  sessions: CreateOnsiteSession[],
  tx?: any
): Promise<OnsiteSession[]> => {
  try {
    const prismaClient = tx || prisma;
    const results = await Promise.all(
      sessions.map(async (session) => {
        const result = await prismaClient.onsite_sessions.create({
          data: session,
        });
        return formatOnSiteSession(result);
      })
    );
    return results;
  } catch (error) {
    handlePrismaError(error);
  }
};

const getAllOnsiteSessions = async (): Promise<OnsiteSession[]> => {
  try {
    const data = await prisma.onsite_sessions.findMany({
      orderBy: { event_at: 'desc' },
    });
    return data.map(formatOnSiteSession);
  } catch (error) {
    handlePrismaError(error);
  }
};

const getOnsiteSessionById = async (id: number): Promise<OnsiteSession> => {
  try {
    const data = await prisma.onsite_sessions.findUniqueOrThrow({
      where: { id },
    });
    return formatOnSiteSession(data);
  } catch (error) {
    handlePrismaError(error);
  }
};

const deleteOnsiteSession = async (id: number): Promise<OnsiteSession> => {
  try {
    const result = await prisma.onsite_sessions.delete({ where: { id } });
    return formatOnSiteSession(result);
  } catch (error) {
    handlePrismaError(error);
  }
};

const deleteOnsiteSessionsByCourseId = async (
  courseId: number,
  tx?: any
): Promise<{ count: number }> => {
  try {
    const prismaClient = tx || prisma;
    return await prismaClient.onsite_sessions.deleteMany({
      where: { course_id: courseId },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

export {
  formatOnSiteSession,
  getAllOnsiteSessions,
  getOnsiteSessionById,
  createOnsiteSession,
  createMultipleOnsiteSessions,
  deleteOnsiteSession,
  deleteOnsiteSessionsByCourseId,
};

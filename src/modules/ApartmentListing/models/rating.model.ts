import prisma from '@/config/client';
import { ConflictError, handlePrismaError } from '@/errors';

export const getCommentsByApartment = async (apartmentId: number) => {
  try {
    const comments = await prisma.rating.findMany({
      where: {
        apartment: { some: { id: apartmentId } },
        comment: { not: null },
      },
      include: {
        users: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return comments;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const getAverageRatingByApartment = async (apartmentId: number) => {
  try {
    const agg = await prisma.rating.aggregate({
      where: {
        apartment: { some: { id: apartmentId } },
        rating: { not: null },
      },
      _avg: { rating: true },
    });

    return agg._avg.rating ?? 0;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const getAllComments = async () => {
  try {
    const comments = await prisma.rating.findMany({
      where: { comment: { not: null } },
      include: { users: true, apartment: true },
      orderBy: { created_at: 'desc' },
    });
    return comments;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const getOverallAverageRating = async () => {
  try {
    const agg = await prisma.rating.aggregate({
      where: { rating: { not: null } },
      _avg: { rating: true },
    });
    return agg._avg.rating ?? 0;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const createRating = async (
  user_id: number,
  apartmentId: number,
  ratingValue: number,
  comment?: string
) => {
  try {
    const existing = await prisma.rating.findFirst({
      where: { user_id: user_id, apartmentId: apartmentId },
    });
    if (existing) {
      throw new ConflictError(
        'Rating already exists for this user and apartment'
      );
    }

    return await prisma.rating.create({
      data: {
        user_id: user_id,
        apartmentId,
        rating: ratingValue,
        comment: comment ?? '',
      },
    });
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const updateRating = async (
  ratingId: number,
  ratingValue: number,
  comment?: string
) => {
  try {
    return await prisma.rating.update({
      where: { id: ratingId },
      data: { rating: ratingValue, comment },
    });
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const deleteRating = async (ratingId: number) => {
  try {
    return await prisma.rating.delete({
      where: { id: ratingId },
    });
  } catch (error) {
    throw handlePrismaError(error);
  }
};

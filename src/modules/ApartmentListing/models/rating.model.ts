import prisma from '@/config/client';
import { ConflictError, handlePrismaError } from '@/errors';
import type { createRatingData, updateRatingData } from '../types';

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

export const createRating = async (data: createRatingData) => {
  try {
    const existing = await prisma.rating.findFirst({
      where: {
        apartment: { some: { id: data.apartmentId } },
        user_id: data.userId,
      },
    });
    if (existing) {
      throw new ConflictError(
        'Rating already exists for this user and apartment'
      );
    }

    return await prisma.rating.create({
      data: {
        user_id: data.userId,
        apartment: { connect: { id: data.apartmentId } },
        rating: data.rating,
        comment: data.comment ?? '',
      },
    });
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const updateRating = async (data: updateRatingData) => {
  try {
    const rating = await prisma.rating.findUnique({
      where: { id: data.ratingId },
      include: { apartment: true },
    });

    if (!rating) {
      throw new Error('Rating not found');
    }

    return await prisma.rating.update({
      where: { id: data.ratingId },
      data: {
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        apartment: true,
        users: true,
      },
    });
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const deleteRating = async (id: number) => {
  try {
    return await prisma.rating.delete({
      where: { id },
    });
  } catch (error) {
    throw handlePrismaError(error);
  }
};

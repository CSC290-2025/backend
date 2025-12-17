import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type {
  ReceiverRequest,
  CreateReceiverRequestData,
  RequestStatus,
} from '../types';

const findAllRequests = async (): Promise<ReceiverRequest[]> => {
  try {
    const requests = await prisma.receiver_requests.findMany({
      orderBy: { created_at: 'desc' },
    });
    return requests;
  } catch (error) {
    handlePrismaError(error);
  }
};

const findRequestById = async (id: number): Promise<ReceiverRequest | null> => {
  try {
    const request = await prisma.receiver_requests.findUnique({
      where: { id },
      include: {
        freecycle_posts: true,
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return request;
  } catch (error) {
    handlePrismaError(error);
  }
};

const findRequestsByReceiverId = async (
  receiverId: number
): Promise<ReceiverRequest[]> => {
  try {
    const requests = await prisma.receiver_requests.findMany({
      where: { receiver_id: receiverId },
      orderBy: { created_at: 'desc' },
    });
    return requests;
  } catch (error) {
    handlePrismaError(error);
  }
};

const findRequestsByPostId = async (
  postId: number
): Promise<ReceiverRequest[]> => {
  try {
    const requests = await prisma.receiver_requests.findMany({
      where: { post_id: postId },
      include: {
        users: { select: { id: true, username: true, email: true } },
      },
      orderBy: { created_at: 'asc' },
    });
    return requests;
  } catch (error) {
    handlePrismaError(error);
  }
};

const createRequest = async (
  data: CreateReceiverRequestData,
  receiverId: number
): Promise<ReceiverRequest> => {
  try {
    const request = await prisma.receiver_requests.create({
      data: {
        post_id: data.post_id,
        receiver_id: receiverId,
        status: 'pending',
      },
    });
    return request;
  } catch (error) {
    handlePrismaError(error);
  }
};

const deleteRequest = async (id: number): Promise<void> => {
  try {
    await prisma.receiver_requests.delete({
      where: { id },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const updateRequestStatus = async (
  id: number,
  status: RequestStatus
): Promise<ReceiverRequest> => {
  try {
    const request = await prisma.receiver_requests.update({
      where: { id },
      data: {
        status,
        updated_at: new Date(),
      },
    });
    return request;
  } catch (error) {
    handlePrismaError(error);
  }
};

const findRequestByUser = async (
  userId: number
): Promise<ReceiverRequest[]> => {
  try {
    const requests = await prisma.receiver_requests.findMany({
      where: {
        receiver_id: userId,
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        freecycle_posts: {
          select: {
            id: true,
            item_name: true,
            description: true,
            photo_url: true,
            is_given: true,
            created_at: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
    return requests;
  } catch (error) {
    handlePrismaError(error);
  }
};

const findRequestByPostAndReceiver = async (
  postId: number,
  receiverId: number
): Promise<ReceiverRequest | null> => {
  try {
    const request = await prisma.receiver_requests.findFirst({
      where: {
        post_id: postId,
        receiver_id: receiverId,
      },
    });
    return request;
  } catch (error) {
    handlePrismaError(error);
    return null;
  }
};

export {
  findAllRequests,
  findRequestById,
  findRequestsByReceiverId,
  findRequestsByPostId,
  createRequest,
  deleteRequest,
  updateRequestStatus,
  findRequestByUser,
  findRequestByPostAndReceiver,
};

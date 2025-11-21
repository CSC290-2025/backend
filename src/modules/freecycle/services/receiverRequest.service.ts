import { ReceiverRequestsModel } from '../models';
import { PostsService } from '@/modules/freecycle/services';
import type {
  ReceiverRequest,
  CreateReceiverRequestData,
  UpdateReceiverRequestData,
} from '../types';
import { NotFoundError, ValidationError, UnauthorizedError } from '@/errors';

const getAllRequests = async (): Promise<ReceiverRequest[]> => {
  return await ReceiverRequestsModel.findAllRequests();
};

const getRequestById = async (id: number): Promise<ReceiverRequest> => {
  const request = await ReceiverRequestsModel.findRequestById(id);
  if (!request) throw new NotFoundError('Request not found');
  return request;
};

const getUserRequests = async (userId: number): Promise<ReceiverRequest[]> => {
  return await ReceiverRequestsModel.findRequestsByReceiverId(userId);
};

const getPostRequests = async (
  postId: number,
  userId: number
): Promise<ReceiverRequest[]> => {
  const post = await PostsService.getPostById(postId);
  if (!post) throw new NotFoundError('Post not found');
  return await ReceiverRequestsModel.findRequestsByPostId(postId);
};

const createRequest = async (
  data: CreateReceiverRequestData,
  receiverId: number
): Promise<ReceiverRequest> => {
  const post = await PostsService.getPostById(data.post_id);
  if (!post) throw new NotFoundError('Post not found');

  // if (post.donater_id === receiverId) {
  //   throw new ValidationError('You cannot request your own post.');
  // }

  return await ReceiverRequestsModel.createRequest(data, receiverId);
};

const deleteRequest = async (id: number, userId: number): Promise<void> => {
  const request = await ReceiverRequestsModel.findRequestById(id);
  if (!request) throw new NotFoundError('Request not found');

  // if (request.receiver_id !== userId) {
  //   throw new UnauthorizedError(
  //     'Unauthorized: You can only cancel your own requests.'
  //   );
  // }

  await ReceiverRequestsModel.deleteRequest(id);
};

const updateRequestStatus = async (
  id: number,
  data: UpdateReceiverRequestData,
  userId: number
): Promise<ReceiverRequest> => {
  const request = await ReceiverRequestsModel.findRequestById(id);
  if (!request) {
    throw new NotFoundError('Receiver Request not found');
  }
  if (!request.post_id) {
    throw new NotFoundError('Post not found in request');
  }
  const post = await PostsService.getPostById(request.post_id);

  return await ReceiverRequestsModel.updateRequestStatus(id, data.status);
};

const getPostsByUserId = async (userId: number): Promise<ReceiverRequest[]> => {
  return await ReceiverRequestsModel.findRequestByUser(userId);
};

export {
  getAllRequests,
  getRequestById,
  getUserRequests,
  getPostRequests,
  createRequest,
  deleteRequest,
  updateRequestStatus,
  getPostsByUserId,
};

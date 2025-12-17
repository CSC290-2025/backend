import { PostsModel } from '../models';
import type {
  FreecyclePost,
  CreateFreecyclePostData,
  UpdateFreecyclePostData,
} from '../types';
import { NotFoundError, ValidationError } from '@/errors';

const getAllPost = async (): Promise<FreecyclePost[]> => {
  return await PostsModel.findAllPosts();
};

const getPostById = async (id: number): Promise<FreecyclePost> => {
  const post = await PostsModel.findPostById(id);
  if (!post) throw new NotFoundError('Post not found');
  return post;
};

const getPostByDonater = async (
  donaterId: number
): Promise<FreecyclePost[]> => {
  return await PostsModel.findPostByDonater(donaterId);
};

//not authorize
const createPost = async (
  data: CreateFreecyclePostData,
  donaterId: number | null
): Promise<FreecyclePost> => {
  if (!data.item_name || data.item_name.trim().length === 0) {
    throw new ValidationError('Item name is required');
  }

  if (data.item_weight !== null && data.item_weight <= 0) {
    throw new ValidationError('Item weight must be greater than 0');
  }

  return await PostsModel.createPost(data, donaterId);
};

const updatePost = async (
  id: number,
  data: UpdateFreecyclePostData,
  donaterId: number
): Promise<FreecyclePost> => {
  const existingPost = await PostsModel.findPostById(id);
  if (!existingPost) throw new NotFoundError('Post not found');
  if (
    data.item_weight !== null &&
    data.item_weight !== undefined &&
    data.item_weight <= 0
  ) {
    throw new ValidationError('Item weight must be greater than 0');
  }

  return await PostsModel.updatePost(id, data, donaterId);
};

const deletePost = async (id: number, donaterId: number): Promise<void> => {
  const existingPost = await PostsModel.findPostById(id);
  if (!existingPost) throw new NotFoundError('Post not found');

  await PostsModel.deletePost(id, donaterId);
};

const markAsGiven = async (
  id: number,
  donaterId: number
): Promise<FreecyclePost> => {
  const post = await PostsModel.findPostById(id);
  if (!post) throw new NotFoundError('Post not found');
  if (post.is_given) {
    throw new ValidationError('Post is already marked as given');
  }
  return await PostsModel.markAsGiven(id, donaterId);
};

const getNotGivenPost = async (): Promise<FreecyclePost[]> => {
  return await PostsModel.findNotGivenPost();
};

const markAsNotGiven = async (
  id: number,
  donaterId: number
): Promise<FreecyclePost> => {
  const post = await PostsModel.findPostById(id);
  if (!post) throw new NotFoundError('Post not found');
  if (!post.is_given) {
    throw new ValidationError('Post is not marked as given yet');
  }

  return await PostsModel.markAsNotGiven(id, donaterId);
};

const getPostsByCategory = async (
  categoryId: number
): Promise<FreecyclePost[]> => {
  return await PostsModel.findPostsByCategoryId(categoryId);
};

const getPostsByUserId = async (userId: number): Promise<FreecyclePost[]> => {
  return await PostsModel.findPostByDonater(userId);
};

const getMyPosts = async (userId: number): Promise<FreecyclePost[]> => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  return await PostsModel.findPostsByUserId(userId);
};

export {
  getAllPost,
  getPostById,
  getPostByDonater,
  createPost,
  updatePost,
  deletePost,
  markAsGiven,
  getNotGivenPost,
  markAsNotGiven,
  getPostsByCategory,
  getPostsByUserId,
  getMyPosts,
};

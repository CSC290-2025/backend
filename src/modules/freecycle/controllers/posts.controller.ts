import type { Context, Handler } from 'hono';
import { PostsService } from '../services';
import { successResponse } from '@/utils/response';

const getAllPost = async (c: Context) => {
  const posts = await PostsService.getAllPost();
  return successResponse(c, { posts });
};

const getPostById = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const post = await PostsService.getPostById(id);
  return successResponse(c, { post });
};

const getPostByDonater: Handler = async (c: Context) => {
  const userId = c.get('user')?.id;
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const posts = await PostsService.getPostByDonater(userId);
  return successResponse(c, { posts });
};

const createPost = async (c: Context) => {
  const body = await c.req.json();
  const donaterId = c.get('user')?.id;
  const post = await PostsService.createPost(body, donaterId);
  return successResponse(c, { post }, 201, 'Post created successfully');
};

const updatePost = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const donaterId = c.get('user')?.id;
  const post = await PostsService.updatePost(id, body, donaterId);
  return successResponse(c, { post }, 200, 'Post updated successfully');
};

const deletePost = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const donaterId = c.get('user')?.id;
  await PostsService.deletePost(id, donaterId);
  return successResponse(c, null, 200, 'Post deleted successfully');
};

const markAsGiven = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const donaterId = c.get('user')?.id;
  const post = await PostsService.markAsGiven(id, donaterId);
  return successResponse(c, { post }, 200, 'Post marked as given');
};

const markAsNotGiven = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const donaterId = c.get('user')?.id;
  const post = await PostsService.markAsNotGiven(id, donaterId);
  return successResponse(c, { post }, 200, 'Post marked as not given');
};

const getNotGivenPost = async (c: Context) => {
  const post = await PostsService.getNotGivenPost();
  return successResponse(c, { post });
};

const getPostsByCategory = async (c: Context) => {
  const categoryId = Number(c.req.param('categoryId'));
  const posts = await PostsService.getPostsByCategory(categoryId);
  return successResponse(c, { posts });
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
};

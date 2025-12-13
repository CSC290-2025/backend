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
  console.log('Getting posts by donater');
  const user = c.get('user');
  const userId = user?.id;
  if (!userId) {
    return c.json({ error: 'Unauthorized: Missing user ID in context' }, 401);
  }
  const posts = await PostsService.getPostByDonater(userId);
  return successResponse(c, { posts });
};

const createPost = async (c: Context) => {
  const body = await c.req.json();
  const userIdFromToken = c.get('user')?.id;
  const donaterId = userIdFromToken || body.donater_id || null;
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
  const posts = await PostsService.getNotGivenPost();
  return successResponse(c, posts);
};

const getPostsByCategory = async (c: Context) => {
  const categoryId = Number(c.req.param('categoryId'));
  const posts = await PostsService.getPostsByCategory(categoryId);
  return successResponse(c, { posts });
};

const getPostsByUserId = async (c: Context) => {
  const userId = Number(c.req.param('userId'));

  const posts = await PostsService.getPostsByUserId(userId);
  return successResponse(c, { posts });
};

const getMyPosts: Handler = async (c: Context) => {
  console.log('📝 Getting my posts');

  // ⭐ ดึง user จาก context ที่ authMiddleware set ไว้
  const user = c.get('user');
  const userId = user?.id;

  if (!userId) {
    return c.json(
      {
        success: false,
        error: 'Unauthorized: Missing user ID in context',
      },
      401
    );
  }

  try {
    const posts = await PostsService.getMyPosts(userId);

    return successResponse(c, {
      posts,
      total: posts.length,
    });
  } catch (error) {
    console.error('❌ Failed to get my posts:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch posts',
      },
      500
    );
  }
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

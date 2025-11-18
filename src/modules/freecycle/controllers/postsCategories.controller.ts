import type { Context } from 'hono';
import { PostCategoriesService } from '../services';
import { successResponse } from '@/utils/response';
import { UnauthorizedError } from '@/errors';

const getCategoriesByPostId = async (c: Context) => {
  const postId = Number(c.req.param('postId'));
  const categories = await PostCategoriesService.getCategoriesByPostId(postId);
  return successResponse(c, { categories });
};

const addCategoryToPost = async (c: Context) => {
  const postId = Number(c.req.param('postId'));
  const body = await c.req.json();
  const donaterId = c.get('user')?.id;
  // if (!donaterId) {
  //   throw new UnauthorizedError();
  // }
  const post = await PostCategoriesService.addCategoryToPost(
    postId,
    body,
    donaterId
  );
  return successResponse(c, { post }, 201, 'add category to post successfully');
};

const addCategoriesToPost = async (c: Context) => {
  const postId = Number(c.req.param('postId'));
  const body = await c.req.json();
  const donaterId = c.get('user')?.id;
  // if (!donaterId) {
  //   throw new UnauthorizedError();
  // }
  const post = await PostCategoriesService.addCategoriesToPost(
    postId,
    body,
    donaterId
  );
  return successResponse(
    c,
    { post },
    201,
    'add categories to post successfully'
  );
};

const removeCategoryFromPost = async (c: Context) => {
  const postId = Number(c.req.param('postId'));
  const categoryId = Number(c.req.param('categoryId'));
  const donaterId = c.get('user')?.id;
  if (!donaterId) {
    throw new UnauthorizedError();
  }
  await PostCategoriesService.removeCategoryFromPost(
    postId,
    categoryId,
    donaterId
  );
  return successResponse(
    c,
    null,
    200,
    'category remove from post successfully'
  );
};

export {
  getCategoriesByPostId,
  addCategoryToPost,
  addCategoriesToPost,
  removeCategoryFromPost,
};

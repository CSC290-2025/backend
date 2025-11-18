import { PostCategoryModel, PostsModel } from '../models';
import type {
  PostCategory,
  AddCategoryToPostData,
  AddCategoriesToPostData,
  CategoryWithName,
} from '../types';
import { NotFoundError, ValidationError } from '@/errors';

const getCategoriesByPostId = async (
  postId: number
): Promise<CategoryWithName[]> => {
  const post = await PostsModel.findPostById(postId);
  if (!post) throw new NotFoundError('Post not found');
  return await PostCategoryModel.findCategoriesByPostId(postId);
};

const addCategoryToPost = async (
  postId: number,
  data: AddCategoryToPostData,
  userId: number
): Promise<PostCategory> => {
  const post = await PostsModel.findPostById(postId);
  if (!post) throw new NotFoundError('Post not found');
  if (post.donater_id !== userId)
    throw new ValidationError(
      'Unauthorized: You can only manage your own posts'
    );
  const hasCategory = await PostCategoryModel.checkPostHasCategory(
    postId,
    data.category_id
  );
  if (hasCategory) {
    throw new ValidationError('This category is already added to the post');
  }
  return await PostCategoryModel.addCategoryToPost(postId, data.category_id);
};

const addCategoriesToPost = async (
  postId: number,
  data: AddCategoriesToPostData,
  userId: number
): Promise<PostCategory[]> => {
  const post = await PostsModel.findPostById(postId);
  if (!post) throw new NotFoundError('Post not found');
  if (post.donater_id !== userId)
    throw new ValidationError(
      'Unauthorized: You can only manage your own posts'
    );

  const uniqueCategoryIds = [...new Set(data.category_id)];
  if (uniqueCategoryIds.length !== data.category_id.length) {
    throw new ValidationError('Duplicate category IDs found');
  }

  return await PostCategoryModel.addCategoriesToPost(postId, uniqueCategoryIds);
};

const removeCategoryFromPost = async (
  postId: number,
  categoryId: number,
  userId: number
): Promise<void> => {
  const post = await PostsModel.findPostById(postId);
  if (!post) throw new NotFoundError('Post not found');
  if (post.donater_id !== userId)
    throw new ValidationError(
      'Unauthorized: You can only manage your own posts'
    );

  const hasCategory = await PostCategoryModel.checkPostHasCategory(
    postId,
    categoryId
  );
  if (!hasCategory) {
    throw new ValidationError('Category not found in post');
  }
  return await PostCategoryModel.removeCategoryFromPost(postId, categoryId);
};

export {
  getCategoriesByPostId,
  addCategoryToPost,
  addCategoriesToPost,
  removeCategoryFromPost,
};

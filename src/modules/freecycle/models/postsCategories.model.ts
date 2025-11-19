import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type {
  PostCategory,
  AddCategoryToPostData,
  AddCategoriesToPostData,
  CategoryWithName,
} from '../types';

const findCategoriesByPostId = async (
  postId: number
): Promise<CategoryWithName[]> => {
  try {
    const categories = await prisma.freecycle_posts_categories.findMany({
      where: { post_id: postId },
      include: {
        freecycle_categories: {
          select: {
            id: true,
            category_name: true,
          },
        },
      },
    });
    return categories.map((cat) => ({
      category_id: cat.category_id,
      category_name: cat.freecycle_categories.category_name,
    }));
  } catch (error) {
    handlePrismaError(error);
  }
};

const addCategoryToPost = async (
  postId: number,
  categoryId: number
): Promise<PostCategory> => {
  try {
    const post = await prisma.freecycle_posts_categories.create({
      data: {
        post_id: postId,
        category_id: categoryId,
      },
    });
    return post;
  } catch (error) {
    handlePrismaError(error);
  }
};

const addCategoriesToPost = async (
  postId: number,
  categoryId: number[]
): Promise<PostCategory[]> => {
  try {
    await prisma.freecycle_posts_categories.deleteMany({
      where: { post_id: postId },
    });

    const data = categoryId.map((categoryId) => ({
      post_id: postId,
      category_id: categoryId,
    }));

    await prisma.freecycle_posts_categories.createMany({
      data,
    });

    const post = await prisma.freecycle_posts_categories.findMany({
      where: { post_id: postId },
    });

    return post;
  } catch (error) {
    handlePrismaError(error);
  }
};

const removeCategoryFromPost = async (
  postId: number,
  categoryId: number
): Promise<void> => {
  try {
    await prisma.freecycle_posts_categories.delete({
      where: {
        post_id_category_id: {
          post_id: postId,
          category_id: categoryId,
        },
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const removeAllCategoriesFromPost = async (postId: number): Promise<void> => {
  try {
    await prisma.freecycle_posts_categories.deleteMany({
      where: { post_id: postId },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const checkPostHasCategory = async (
  postId: number,
  categoryId: number
): Promise<boolean> => {
  try {
    const post = await prisma.freecycle_posts_categories.findUnique({
      where: {
        post_id_category_id: {
          post_id: postId,
          category_id: categoryId,
        },
      },
    });

    return post !== null;
  } catch (error) {
    handlePrismaError(error);
  }
};

export {
  findCategoriesByPostId,
  addCategoryToPost,
  addCategoriesToPost,
  removeCategoryFromPost,
  removeAllCategoriesFromPost,
  checkPostHasCategory,
};

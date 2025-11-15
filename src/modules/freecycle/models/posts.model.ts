import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type {
  FreecyclePost,
  CreateFreecyclePostData,
  UpdateFreecyclePostData,
} from '../types';

const findAllPosts = async (): Promise<FreecyclePost[]> => {
  try {
    const posts = await prisma.freecycle_posts.findMany({
      orderBy: { created_at: 'desc' },
    });
    return posts.map((p) => ({
      ...p,
      item_weight: p.item_weight ? Number(p.item_weight) : null,
    }));
  } catch (error) {
    handlePrismaError(error);
  }
};

const findPostById = async (id: number): Promise<FreecyclePost | null> => {
  try {
    const post = await prisma.freecycle_posts.findUnique({
      where: { id },
    });
    if (!post) return null;
    return {
      ...post,
      item_weight: post.item_weight ? Number(post.item_weight) : null,
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const findPostByDonater = async (
  donaterId: number
): Promise<FreecyclePost[]> => {
  try {
    const posts = await prisma.freecycle_posts.findMany({
      where: { donater_id: donaterId },
      orderBy: { created_at: 'desc' },
    });
    return posts.map((p) => ({
      ...p,
      item_weight: p.item_weight ? Number(p.item_weight) : null,
    }));
  } catch (error) {
    handlePrismaError(error);
  }
};

//not authorize
const createPost = async (
  data: CreateFreecyclePostData,
  donaterId: number | null
): Promise<FreecyclePost> => {
  try {
    const post = await prisma.freecycle_posts.create({
      data: {
        item_name: data.item_name,
        item_weight: data.item_weight,
        photo_url: data.photo_url,
        description: data.description,
        donate_to_department_id: data.donate_to_department_id,
        donater_id: donaterId,
      },
    });
    return {
      ...post,
      item_weight: post.item_weight ? Number(post.item_weight) : null,
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const updatePost = async (
  id: number,
  data: UpdateFreecyclePostData,
  donaterId: number
): Promise<FreecyclePost> => {
  try {
    const existingPost = await prisma.freecycle_posts.findUnique({
      where: { id },
    });
    if (!existingPost) {
      throw new Error('Post not found');
    }
    if (existingPost.donater_id !== donaterId) {
      throw new Error('Unauthorized: You can only update your own posts');
    }
    const post = await prisma.freecycle_posts.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
    return {
      ...post,
      item_weight: post.item_weight ? Number(post.item_weight) : null,
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const deletePost = async (id: number, donaterId: number): Promise<void> => {
  try {
    const existingPost = await prisma.freecycle_posts.findUnique({
      where: { id },
    });
    if (!existingPost) {
      throw new Error('Post not found');
    }
    if (existingPost.donater_id !== donaterId) {
      throw new Error('Unauthorized: You can only delete your own posts');
    }
    await prisma.freecycle_posts.delete({
      where: { id },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const markAsGiven = async (
  id: number,
  donaterId: number
): Promise<FreecyclePost> => {
  try {
    const existingPost = await prisma.freecycle_posts.findUnique({
      where: { id },
    });
    if (!existingPost) {
      throw new Error('Post not found');
    }
    if (existingPost.donater_id !== donaterId) {
      throw new Error('Unauthorized');
    }
    const post = await prisma.freecycle_posts.update({
      where: { id },
      data: { is_given: true },
    });
    return {
      ...post,
      item_weight: post.item_weight ? Number(post.item_weight) : null,
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const findNotGivenPost = async (): Promise<FreecyclePost[]> => {
  try {
    const posts = await prisma.freecycle_posts.findMany({
      where: { is_given: false },
      orderBy: { created_at: 'desc' },
    });
    return posts.map((p) => ({
      ...p,
      item_weight: p.item_weight ? Number(p.item_weight) : null,
    }));
  } catch (error) {
    handlePrismaError(error);
  }
};

const markAsNotGiven = async (
  id: number,
  donaterId: number
): Promise<FreecyclePost> => {
  try {
    const existingPost = await prisma.freecycle_posts.findUnique({
      where: { id },
    });
    if (!existingPost) {
      throw new Error('Post not found');
    }
    if (existingPost.donater_id !== donaterId) {
      throw new Error('Unauthorized');
    }
    const post = await prisma.freecycle_posts.update({
      where: { id },
      data: { is_given: false },
    });
    return {
      ...post,
      item_weight: post.item_weight ? Number(post.item_weight) : null,
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const findPostsByCategoryId = async (
  categoryId: number
): Promise<FreecyclePost[]> => {
  try {
    const posts = await prisma.freecycle_posts.findMany({
      where: {
        freecycle_posts_categories: {
          some: { category_id: categoryId },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return posts.map((p) => ({
      ...p,
      item_weight: p.item_weight ? Number(p.item_weight) : null,
    }));
  } catch (error) {
    handlePrismaError(error);
  }
};

export {
  findAllPosts,
  findPostById,
  findPostByDonater,
  createPost,
  updatePost,
  deletePost,
  markAsGiven,
  findNotGivenPost,
  markAsNotGiven,
  findPostsByCategoryId,
};

import type { z } from 'zod';
import type { FreecyclePostsCategoriesSchemas } from '../schemas';

type PostCategory = z.infer<
  typeof FreecyclePostsCategoriesSchemas.FreecyclePostsCategoriesSchema
>;
type AddCategoryToPostData = z.infer<
  typeof FreecyclePostsCategoriesSchemas.AddCategoryToPostSchema
>;
type AddCategoriesToPostData = z.infer<
  typeof FreecyclePostsCategoriesSchemas.AddCategoriesToPostSchema
>;
type CategoryWithName = {
  category_id: number;
  category_name: string;
};

export type {
  PostCategory,
  AddCategoryToPostData,
  AddCategoriesToPostData,
  CategoryWithName,
};

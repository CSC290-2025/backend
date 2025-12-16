import type { z } from 'zod';
import type { CategorySchemas } from '../schemas';

type Category = z.infer<typeof CategorySchemas.CategorySchema>;
type CreateCategoryData = z.infer<typeof CategorySchemas.CreateCategorySchema>;
type UpdateCategoryData = z.infer<typeof CategorySchemas.UpdateCategorySchema>;

export type { Category, CreateCategoryData, UpdateCategoryData };

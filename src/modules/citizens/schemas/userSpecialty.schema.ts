import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const UserSpecialtySchema = z.object({
  user_id: z.number(),
  specialty_id: z.number(),
});

const CreateUserSpecialtySchema = z.object({
  user_id: z.number(),
  specialty_id: z.number(),
});

const createUserSpecialty = createPostRoute({
  path: '/user-specialty',
  summary: 'Create new user specialty',
  requestSchema: CreateUserSpecialtySchema,
  responseSchema: UserSpecialtySchema,
});

export const UserSpecialtySchemas = {
  UserSpecialtySchema,
  CreateUserSpecialtySchema,
  createUserSpecialty,
};

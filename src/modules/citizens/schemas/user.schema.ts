import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const UserinfoAndWalletSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.email(),
  phone: z.string().nullable(),
});

const UserIdParam = z.object({
  id: z.coerce.number(),
});

const getUserinfoAndWallet = createGetRoute({
  path: '/users/wallet/{id}',
  summary: 'Get user data and user wallet by user ID',
  responseSchema: UserinfoAndWalletSchema,
  params: UserIdParam,
});

export const UserSchemas = {
  getUserinfoAndWallet,
};

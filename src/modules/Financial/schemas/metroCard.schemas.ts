import { createGetRoute, createPostRoute } from '@/utils/openapi-helpers';
import { z } from 'zod';

const MetroCardSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  balance: z.number().default(0),
  card_number: z.string(),
  status: z.enum(['active', 'suspended']),
  created_at: z.date(),
  updated_at: z.date(),
});

const CreateMetroCardSchema = z.object({
  user_id: z.number(),
});

const MetroCardListSchema = z.object({
  products: z.array(MetroCardSchema),
});

//Parameter Schema
const UserIdParam = z.object({
  userId: z.coerce.number(),
});

const WalletIdParam = z.object({
  metroCardId: z.coerce.number(),
});

// OpenAPI route
const createMetroCardRoute = createPostRoute({
  path: '/metro-cards',
  summary: 'Create new metro card',
  requestSchema: CreateMetroCardSchema,
  responseSchema: MetroCardSchema,
  tags: ['MetroCards'],
});

const getUserMetroCardRoute = createGetRoute({
  path: '/metro-cards/user/{userId}',
  summary: 'Get user metro cards',
  responseSchema: MetroCardListSchema,
  params: UserIdParam,
  tags: ['MetroCards'],
});

const getMetroCardRoute = createGetRoute({
  path: '/metro-cards/{metroCardId}',
  summary: 'Get metro card by ID',
  responseSchema: MetroCardSchema,
  params: WalletIdParam,
  tags: ['MetroCards'],
});

export const MetroCardSchemas = {
  MetroCardSchema,
  CreateMetroCardSchema,
  createMetroCardRoute,
  UserIdParam,
  MetroCardListSchema,
  getUserMetroCardRoute,
  getMetroCardRoute,
};

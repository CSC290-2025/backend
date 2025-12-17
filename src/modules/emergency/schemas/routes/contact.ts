import { createGetRoute, createPostRoute } from '@/utils/openapi-helpers.ts';
import { ContactSchemas } from '@/modules/emergency/schemas';
import * as z from 'zod';

const createContactRoute = createPostRoute({
  path: 'emergency/contacts',
  summary: 'Create new contact',
  requestSchema: ContactSchemas.CreateContactSchema,
  responseSchema: ContactSchemas.ContactResponseSchema,
  tags: ['Report'],
});

const findContactByUserIdRoute = createGetRoute({
  path: 'emergency/contacts/{user_id}',
  summary: 'Find contact by userId',
  params: z.object({
    user_id: z.string(),
  }),
  responseSchema: ContactSchemas.FindContactByUserIdSchema,
  tags: ['Report'],
});

export { createContactRoute, findContactByUserIdRoute };

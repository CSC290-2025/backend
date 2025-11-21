import type { Context } from 'hono';
import { ContactService } from '@/modules/emergency/services';
import { successResponse } from '@/utils/response.ts';
import type { ContactResponse } from '@/modules/emergency/types';

export const createContact = async (c: Context) => {
  const body = await c.req.json();
  const contact = await ContactService.createContact(body);
  return successResponse(c, { contact }, 201, 'Create Contact successfully');
};

export const findContactByUserId = async (c: Context) => {
  const { userId } = await c.req.param();
  const newUserId = Number(userId);

  const contact = await ContactService.findContactByUserId(newUserId);
  return successResponse(
    c,
    { contact },
    201,
    'Find Contact by userId successfully'
  );
};

export const updateContact = async (c: Context) => {
  const body = await c.req.json();
  const contact = await ContactService.updateContact(body);
  return successResponse(c, { contact }, 201, 'Update Contact successfully');
};

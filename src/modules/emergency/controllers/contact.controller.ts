import type { Context, Handler } from 'hono';
import { ContactService } from '@/modules/emergency/services';
import { successResponse } from '@/utils/response.ts';

export const createContact = async (c: Context) => {
  const body = await c.req.json();
  const contact = await ContactService.createContact(body);
  return successResponse(c, { contact }, 201, 'Create Contact successfully');
};

export const findContactByUserId: Handler = async (c: Context) => {
  const { user_id } = await c.req.param();
  const newUserId = Number(user_id);

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

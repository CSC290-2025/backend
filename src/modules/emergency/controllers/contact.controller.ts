import type { Context, Handler } from 'hono';
import { ContactService, ReportService } from '@/modules/emergency/services';
import { successResponse } from '@/utils/response.ts';

export const createContact = async (c: Context) => {
  const body = await c.req.json();
  const contact = await ContactService.createContact(body);
  return successResponse(c, { contact }, 201, 'Create Contact successfully');
};

export const findContactByUserId: Handler = async (c: Context) => {
  const { user_id } = c.req.param();
  const newUserId = Number(user_id);

  const contact = await ContactService.findContactByUserId(newUserId);
  return successResponse(
    c,
    { contact },
    201,
    'Find Contact by userId successfully'
  );
};

export const updateContactById: Handler = async (c: Context) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  const newId = Number(id);
  const contact = await ContactService.updateContactById(newId, body);
  return successResponse(c, { contact }, 200, 'Update Contact successfully');
};

export const deleteContactById: Handler = async (c: Context) => {
  const { id } = c.req.param();

  const contact = await ContactService.deleteContactById(Number(id));
  return successResponse(
    c,
    { id_delete: contact.id },
    200,
    'Contact deleted successfully'
  );
};

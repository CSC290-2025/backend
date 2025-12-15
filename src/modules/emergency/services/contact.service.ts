import type {
  CreateContact,
  ContactResponse,
  UpdateContact,
} from '@/modules/emergency/types';
import { ContactModel } from '@/modules/emergency/models';
import { NotFoundError } from '@/errors';

export const findContactByUserId = async (
  userId: number
): Promise<ContactResponse[]> => {
  const contact = await ContactModel.findContactByUserId(userId);

  if (contact.length === 0) {
    throw new NotFoundError('Not Found this user id');
  }
  return contact;
};

export const createContact = async (
  data: CreateContact
): Promise<ContactResponse> => {
  return await ContactModel.creatContact(data);
};

export const updateContact = async (data: ContactResponse) => {
  return await ContactModel.updateContact(data);
};

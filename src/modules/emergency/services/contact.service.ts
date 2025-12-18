import type {
  CreateContact,
  ContactResponse,
  UpdateContact,
  ReportDeleteResponse,
  DeleteContactResponse,
} from '@/modules/emergency/types';
import { ContactModel, ReportModel } from '@/modules/emergency/models';
import { NotFoundError, ValidationError } from '@/errors';

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

export const updateContactById = async (
  id: number,
  data: UpdateContact
): Promise<Partial<ContactResponse>> => {
  if (!id) throw new ValidationError('Id is required');
  return await ContactModel.updateContactById(id, data);
};

export const deleteContactById = async (
  id: number
): Promise<DeleteContactResponse> => {
  if (!id) throw new ValidationError('Id is required');
  return await ContactModel.deleteContactById(id);
};

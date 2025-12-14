import prisma from '@/config/client.ts';
import type {
  ContactResponse,
  CreateContact,
  UpdateContact,
  DeleteContactResponse,
} from '@/modules/emergency/types';
import { handlePrismaError, NotFoundError, ValidationError } from '@/errors';

const creatContact = async (data: CreateContact): Promise<ContactResponse> => {
  try {
    const existContact = await prisma.emergency_contacts.findFirst({
      where: {
        contact_name: data.contact_name,
      },
      select: { id: true },
    });

    if (existContact) {
      throw new ValidationError('Contact name already exists');
    }
    return await prisma.emergency_contacts.create({
      data,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    handlePrismaError(error);
  }
};

const findContactByUserId = async (
  user_id: number
): Promise<ContactResponse[]> => {
  try {
    return prisma.emergency_contacts.findMany({
      where: {
        user_id: user_id,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const updateContactById = async (
  id: number,
  data: UpdateContact
): Promise<Partial<ContactResponse>> => {
  try {
    const existContact = await prisma.emergency_contacts.findUnique({
      where: { id: id },
    });

    if (!existContact) {
      throw new NotFoundError(`Contact with id ${id} not found`);
    }

    return await prisma.emergency_contacts.update({
      where: {
        id: id,
      },
      data: data,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    handlePrismaError(error);
  }
};

const deleteContactById = async (
  id: number
): Promise<DeleteContactResponse> => {
  try {
    const contact = await prisma.emergency_contacts.delete({
      where: { id: id },
    });
    return { id: contact.id };
  } catch (error) {
    handlePrismaError(error);
  }
};

export {
  creatContact,
  findContactByUserId,
  updateContactById,
  deleteContactById,
};

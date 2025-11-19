import prisma from '@/config/client.ts';
import type { ContactResponse, CreateContact } from '@/modules/emergency/types';
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

const updateContact = async (data: ContactResponse) => {
  try {
    const existContact = await prisma.emergency_contacts.findUnique({
      where: { id: data.id },
    });

    if (!existContact) {
      throw new NotFoundError(`Contact with id ${data.id} not found`);
    }

    return await prisma.emergency_contacts.update({
      where: {
        id: data.id,
      },
      data: {
        contact_name: data.contact_name ?? existContact.contact_name,
        phone: data.phone ?? existContact.phone,
        user_id: data.user_id ?? existContact.user_id,
      },
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    handlePrismaError(error);
  }
};

export { creatContact, findContactByUserId, updateContact };

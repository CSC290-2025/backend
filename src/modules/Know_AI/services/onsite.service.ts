import { NotFoundError } from '@/errors';
import { OnsiteSessionModel } from '@/modules/Know_AI/models';
import type { onsite, createOnsite } from '@/modules/Know_AI/types';

const getAllOnsiteSession = async (): Promise<onsite[]> => {
  return await OnsiteSessionModel.getAllOnsiteSessions();
};

const getOnsiteSessionById = async (id: number): Promise<onsite> => {
  const data = await OnsiteSessionModel.getOnsiteSessionById(id);
  if (!data)
    throw new NotFoundError(`OnsiteSession with id ${id} is not found.`);
  return data;
};

const createOnsiteSession = async (data: createOnsite): Promise<onsite> => {
  return await OnsiteSessionModel.createOnsiteSession(data);
};

const deleteOnsiteSession = async (id: number): Promise<onsite> => {
  const data = await OnsiteSessionModel.getOnsiteSessionById(id);
  if (!data)
    throw new NotFoundError(`OnsiteSession with id ${id} is not found.`);
  return await OnsiteSessionModel.deleteOnsiteSession(id);
};

export {
  getAllOnsiteSession,
  getOnsiteSessionById,
  createOnsiteSession,
  deleteOnsiteSession,
};

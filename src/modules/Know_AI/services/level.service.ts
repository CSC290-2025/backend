import { LevelModel } from '@/modules/Know_AI/models';
import type { level, levelId } from '@/modules/Know_AI/types';

const getLevel = async (id: number): Promise<level> => {
  return await LevelModel.getLevel(id);
};

export { getLevel };

import { ETLModel } from '../models';
import type { ExtractedData } from '../types';
import { NotFoundError, ValidationError } from '@/errors';

const getExtractedData = async (): Promise<ExtractedData> => {
  const data = await ETLModel.extractAllData();
  if (!data) throw new NotFoundError('No data found');
  return data;
};

export { getExtractedData };

import type { Context } from 'hono';
import { ETLService } from '../services';
import { successResponse } from '@/utils/response';

const getExtractedData = async (c: Context) => {
  const data = await ETLService.getExtractedData();
  return successResponse(c, { data });
};

export { getExtractedData };

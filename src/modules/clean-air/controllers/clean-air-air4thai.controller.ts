import type { Context } from 'hono';
import { successResponse } from '@/utils/response';
import { Air4ThaiService } from '../services';

const getBangkokDistrictAQI = async (c: Context) => {
  const districts = await Air4ThaiService.getBangkokDistrictAQI();
  return successResponse(c, { districts });
};

export { getBangkokDistrictAQI };

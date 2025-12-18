import type { Context } from 'hono';
import { successResponse } from '@/utils/response';
import * as AddressModel from '../models/address.model';

const listAddresses = async (c: Context) => {
  const addresses = await AddressModel.findAll();
  return successResponse(c, { addresses });
};

export { listAddresses };

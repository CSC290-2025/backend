import { addressModel } from '../models/addressG5.model';
import type { UserWithAddress } from '../types/addressG5.types';

export const addressService = {
  async getUsersByDistrict(district: string): Promise<UserWithAddress[]> {
    if (!district) {
      throw new Error('District parameter is required');
    }

    const users = await addressModel.getUsersByDistrict(district);

    return users || [];
  },
};

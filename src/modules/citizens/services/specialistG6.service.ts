import { userSpecialistModel } from '../models/specialistG6.model';
import type { UserSpecialistResponse } from '../types/specialistG6.type';

export const userSpecialistService = {
  async getUserSpecialists(userId: number): Promise<UserSpecialistResponse> {
    if (!userId || isNaN(userId)) {
      throw new Error('Invalid user ID');
    }

    return await userSpecialistModel.getUserSpecialists(userId);
  },
};

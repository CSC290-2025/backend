import type { Context } from 'hono';
import { UserSpecialtyG1Service } from '../services';
import { successResponse } from '@/utils/response';

const createUserSpecialty = async (c: Context) => {
  const body = await c.req.json();
  const userSpecialty = await UserSpecialtyG1Service.createUserSpecialty(body);
  return successResponse(
    c,
    { userSpecialty },
    201,
    'User Specialty create successfully'
  );
};

export { createUserSpecialty };

import type { Context } from 'hono';
import { UserG8Service } from '../services';
import { successResponse } from '@/utils/response';

const getUserinfoAndWallet = async (c: Context) => {
  const id = parseInt(c.req.param('id'));
  const user = await UserG8Service.getUserinfoAndWallet(id);
  return successResponse(
    c,
    { user },
    200,
    'User info and wallet fetch successfully'
  );
};

export { getUserinfoAndWallet };

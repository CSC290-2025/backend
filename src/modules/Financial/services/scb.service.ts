import { ScbModel } from '../models';
import type { ScbToken } from '../types';

// the same as the one from model no business logic added
const getOAuthToken = async (): Promise<ScbToken> => {
  return await ScbModel.getOAuthToken();
};

export { getOAuthToken };

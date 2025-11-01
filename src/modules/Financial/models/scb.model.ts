import type { ScbToken } from '../types';
import { handlePrismaError } from '@/errors';

const SCB_BASE_URL = 'https://api-sandbox.partners.scb/partners/sandbox';

// We wont need to store this since scb uses it for their own tracking
const generateRequestUId = () => {
  return crypto.randomUUID();
};

// In-memory token storage
let cachedToken: ScbToken | null;

// to get/refresh OAuth token automatically
// call this in your scb api when you need a token
// e.g. const token = ScbModel.getOAuthToken();
// will auto refresh
const getOAuthToken = async (): Promise<ScbToken> => {
  try {
    // Return cached token if still balid
    if (cachedToken && cachedToken.expiresAt > Date.now()) {
      return cachedToken;
    }

    const apiKey = process.env.G11_SCB_API_KEY || '';
    const apiSecret = process.env.G11_SCB_API_SECRET || '';

    if (!apiKey || !apiSecret) {
      handlePrismaError(new Error('API credentials 404, check your env😭🥀'));
    }

    // call scb oauth token api
    // default headers
    // body from .env
    const response = await fetch(`${SCB_BASE_URL}/v1/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept-language': 'EN',
        requestUId: generateRequestUId(),
        resourceOwnerId: apiKey,
      },
      body: JSON.stringify({
        applicationKey: apiKey,
        applicationSecret: apiSecret,
      }),
    });

    const result = await response.json();

    // Cache token
    // calculate expire date from the duration returned from scb api
    const expiresAt = Date.now() + result.data.expiresIn * 1000;
    cachedToken = { ...result.data, expiresAt };

    return cachedToken as ScbToken;
  } catch (error) {
    handlePrismaError(error);
  }
};

export { getOAuthToken };

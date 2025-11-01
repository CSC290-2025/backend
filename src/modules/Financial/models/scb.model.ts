import { randomUUID, publicEncrypt, publicDecrypt, constants } from 'crypto';
import type { ScbToken } from '../types';
import { handlePrismaError } from '@/errors';

const SCB_BASE_URL = 'https://api-sandbox.partners.scb/partners/sandbox';

// We wont need to store this since scb uses it for their own tracking
const generateRequestUId = () => {
  return randomUUID();
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

const encryptData = (data: string, publicKey: string): string => {
  try {
    const formattedKey = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
    const buffer = Buffer.from(data, 'utf-8');
    const encrypted = publicEncrypt(
      { key: formattedKey, padding: constants.RSA_PKCS1_PADDING },
      buffer
    );
    return encrypted.toString('base64');
  } catch (error) {
    handlePrismaError(error);
  }
};

const decryptData = (cipherText: string, publicKey: string): string => {
  try {
    const formattedKey = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
    const buffer = Buffer.from(cipherText, 'base64');
    const decrypted = publicDecrypt(
      { key: formattedKey, padding: constants.RSA_PKCS1_PADDING },
      buffer
    );
    return decrypted.toString('utf8');
  } catch (error) {
    handlePrismaError(error);
  }
};

export { getOAuthToken, encryptData, decryptData };

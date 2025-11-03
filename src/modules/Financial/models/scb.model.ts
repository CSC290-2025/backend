import { randomUUID, publicEncrypt, publicDecrypt, constants } from 'crypto';
import type {
  ScbToken,
  ScbQrRequestSchema,
  ScbQrResponseSchema,
} from '../types';
import { handlePrismaError } from '@/errors';

const SCB_BASE_URL = 'https://api-sandbox.partners.scb/partners/sandbox';

// In-memory token storage
let cachedToken: ScbToken | null = null;
// We wont need to store this since scb uses it for their own tracking
const generateRequestUId = () => {
  return randomUUID();
};

// Reusable header builder
const buildScbHeaders = async (includeAuth = false): Promise<HeadersInit> => {
  try {
    const apiKey = process.env.G11_SCB_API_KEY;

    if (!apiKey) {
      throw new Error('G11_SCB_API_KEY not configured');
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'accept-language': 'EN',
      requestUId: generateRequestUId(),
      resourceOwnerId: apiKey,
    };

    if (includeAuth) {
      // Auto-generate or refresh token if expired
      const token = await getOAuthToken();
      headers.authorization = `Bearer ${token.accessToken}`;
    }

    return headers;
  } catch (error) {
    handlePrismaError(error);
  }
};

// to get/refresh OAuth token automatically
// call this in your scb api when you need a token
// e.g. const token = ScbModel.getOAuthToken();
// will auto refresh
const getOAuthToken = async (): Promise<ScbToken> => {
  try {
    // Return cached token if still valid
    if (cachedToken && cachedToken.expiresAt > Date.now()) {
      return cachedToken;
    }

    const apiKey = process.env.G11_SCB_API_KEY;
    const apiSecret = process.env.G11_SCB_API_SECRET;

    if (!apiKey || !apiSecret) {
      throw new Error('SCB API credentials not configured');
    }

    // call scb oauth token api
    // default headers
    // body from .env
    const response = await fetch(`${SCB_BASE_URL}/v1/oauth/token`, {
      method: 'POST',
      headers: await buildScbHeaders(false),
      body: JSON.stringify({
        applicationKey: apiKey,
        applicationSecret: apiSecret,
      }),
    });

    if (!response.ok) {
      throw new Error('SCB OAuth failed');
    }

    const result = await response.json();

    // Cache token
    // calculate expire date from the duration returned from scb api
    const expiresAt = Date.now() + result.data.expiresIn * 1000;
    const token: ScbToken = { ...result.data, expiresAt };
    cachedToken = token;

    return token;
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
    return decrypted.toString('utf-8');
  } catch (error) {
    handlePrismaError(error);
  }
};

const createQr = async (
  data: ScbQrRequestSchema
): Promise<ScbQrResponseSchema> => {
  try {
    const response = await fetch(`${SCB_BASE_URL}/v1/payment/qrcode/create`, {
      method: 'POST',
      headers: await buildScbHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('SCB QR creation failed');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    handlePrismaError(error);
  }
};

export { getOAuthToken, encryptData, decryptData, createQr };

import { randomUUID, publicEncrypt, publicDecrypt, constants } from 'crypto';
import type {
  ScbToken,
  ScbQrCreateRequest,
  ScbQrCreateResponse,
  ScbOAuthResponse,
  ScbVerifyScbResponse,
} from '../types';
import {
  handlePrismaError,
  ValidationError,
  InternalServerError,
  NotFoundError,
  BaseError,
  PaymentNotConfirmedError,
} from '@/errors';
import prisma from '@/config/client';
import { Decimal } from '@prisma/client/runtime/library';
import { findWalletById, WalletBalanceTopup } from './wallet.model';
import type { transaction_type } from '@/generated/prisma';

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
      throw new ValidationError('G11_SCB_API_KEY not configured');
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
    if (error instanceof BaseError) {
      throw error;
    }
    throw new InternalServerError(
      error instanceof Error ? error.message : 'Unknown error'
    );
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
      throw new ValidationError('SCB API credentials not configured');
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
      throw new InternalServerError('SCB OAuth failed');
    }

    const result: ScbOAuthResponse = await response.json();

    // Cache token
    // calculate expire date from the duration returned from scb api
    const expiresAt = Date.now() + result.data.expiresIn * 1000;
    const token: ScbToken = { ...result.data, expiresAt };
    cachedToken = token;

    return token;
  } catch (error) {
    if (error instanceof BaseError) {
      throw error;
    }
    throw new InternalServerError(
      error instanceof Error ? error.message : 'Unknown error'
    );
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
    if (error instanceof BaseError) {
      throw error;
    }
    throw new InternalServerError(
      error instanceof Error ? error.message : 'Unknown error'
    );
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
    if (error instanceof BaseError) {
      throw error;
    }
    throw new InternalServerError(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

const createQr = async (
  data: ScbQrCreateRequest
): Promise<ScbQrCreateResponse> => {
  try {
    const response = await fetch(`${SCB_BASE_URL}/v1/payment/qrcode/create`, {
      method: 'POST',
      headers: await buildScbHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new InternalServerError('SCB QR creation failed');
    }

    const result: ScbQrCreateResponse = await response.json();
    return result;
  } catch (error) {
    if (error instanceof BaseError) {
      throw error;
    }
    throw new InternalServerError(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

const verifyPayment = async (
  transRef: string,
  sendingBank: string
): Promise<ScbVerifyScbResponse> => {
  try {
    const response = await fetch(
      `${SCB_BASE_URL}/v1/payment/billpayment/transactions/${transRef}?sendingBank=${sendingBank}`,
      {
        headers: await buildScbHeaders(true),
      }
    );
    if (!response.ok) {
      throw new InternalServerError('SCB verify failed');
    }

    const result: ScbVerifyScbResponse = await response.json();
    return result;
  } catch (error) {
    if (error instanceof BaseError) {
      throw error;
    }
    throw new InternalServerError(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

const createWalletTransaction = async (data: {
  wallet_id: number;
  transaction_type: transaction_type;
  amount: number;
  target_service: string;
  description: string;
}) => {
  try {
    return await prisma.wallet_transactions.create({
      data: {
        wallet_id: data.wallet_id,
        transaction_type: data.transaction_type,
        amount: new Decimal(data.amount),
        target_service: data.target_service,
        description: data.description,
      },
    });
  } catch (error) {
    if (error instanceof BaseError) {
      throw error;
    }
    handlePrismaError(error);
  }
};

const updateTransactionDescription = async (
  reference1: string,
  transactionId: string,
  sendingBank: string
) => {
  try {
    await prisma.$transaction(async (tx) => {
      const transaction = await tx.wallet_transactions.findFirst({
        where: { description: reference1 },
      });

      if (!transaction) {
        throw new ValidationError('Transaction not found');
      }

      const newDescription = `${transaction.description}|${transactionId}|${sendingBank}`;

      // Update transaction description
      await tx.wallet_transactions.update({
        where: { id: transaction.id },
        data: { description: newDescription },
      });

      // Top up wallet balance
      await WalletBalanceTopup(
        transaction.wallet_id!,
        Number(transaction.amount),
        'increment',
        tx
      );
    });
  } catch (error) {
    if (error instanceof BaseError) {
      throw error;
    }
    handlePrismaError(error);
  }
};

const findTransactionForVerification = async (ref1: string) => {
  try {
    const transaction = await prisma.wallet_transactions.findFirst({
      where: {
        description: { startsWith: ref1 },
        target_service: 'wallet_top',
      },
    });

    if (!transaction) {
      throw new NotFoundError('Transaction not found for verification');
    }

    if (!transaction.description!.includes('|')) {
      throw new PaymentNotConfirmedError(
        'Transaction not yet confirmed by SCB'
      );
    }

    const parts = transaction.description!.split('|');
    if (parts.length < 3) {
      throw new ValidationError(
        'Transaction description is malformed or not fully updated'
      );
    }

    const transactionId = parts[1];
    const sendingBank = parts[2];

    const wallet = await findWalletById(transaction.wallet_id!);
    if (!wallet) {
      throw new NotFoundError('Associated wallet not found');
    }

    return { transactionId, sendingBank, wallet };
  } catch (error) {
    if (error instanceof BaseError) {
      throw error;
    }
    handlePrismaError(error);
  }
};

export {
  getOAuthToken,
  encryptData,
  decryptData,
  createQr,
  verifyPayment,
  createWalletTransaction,
  updateTransactionDescription,
  findTransactionForVerification,
};

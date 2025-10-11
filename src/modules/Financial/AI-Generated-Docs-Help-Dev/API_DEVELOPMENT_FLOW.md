# API Development Flow - Adding New Endpoints

## Overview

This document provides a systematic approach for developers to add new API endpoints to the Financial module following established architecture patterns.

## Development Flow (In Order)

### 1. **SCHEMAS** - Define Data Structure First

**File**: `src/modules/Financial/schemas/wallet.schemas.ts`

**Purpose**: Define request/response schemas and validation rules
**Why First**: Establishes the API contract and data structure before implementation

```typescript
// Example: Adding a "transfer money" endpoint

// 1a. Add request schema
const TransferMoneySchema = z.object({
  from_wallet_id: z.number().positive(),
  to_wallet_id: z.number().positive(),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
});

// 1b. Add parameter schema (if needed)
const TransferIdParam = z.object({
  transferId: z.coerce.number(),
});

// 1c. Add response schema (if different from existing)
const TransferResponseSchema = z.object({
  transfer: z.object({
    id: z.number(),
    from_wallet_id: z.number(),
    to_wallet_id: z.number(),
    amount: z.number(),
    status: z.enum(['pending', 'completed', 'failed']),
    created_at: z.date(),
  }),
});

// 1d. Create OpenAPI route definition
const transferMoneyRoute = createPostRoute({
  path: '/wallets/transfer',
  summary: 'Transfer money between wallets',
  requestSchema: TransferMoneySchema,
  responseSchema: TransferResponseSchema,
  tags: ['Wallets'],
});

// 1e. Export in WalletSchemas object
export const WalletSchemas = {
  // ... existing schemas
  TransferMoneySchema,
  TransferResponseSchema,
  transferMoneyRoute,
};
```

---

### 2. **TYPES** - Define TypeScript Types

**File**: `src/modules/Financial/types/wallet.types.ts`

**Purpose**: Create TypeScript types for type safety
**Why Second**: Types are derived from schemas for consistency

```typescript
// 2a. Import new schemas
import type { WalletSchemas } from '../schemas';

// 2b. Create types from schemas
type TransferMoneyData = z.infer<typeof WalletSchemas.TransferMoneySchema>;
type TransferResponse = z.infer<typeof WalletSchemas.TransferResponseSchema>;

// 2c. Export types
export type {
  // ... existing types
  TransferMoneyData,
  TransferResponse,
};
```

---

### 3. **MODELS** - Database Layer

**File**: `src/modules/Financial/models/wallet.model.ts`

**Purpose**: Handle database operations (CRUD)
**Why Third**: Data layer foundation needs to be established

```typescript
// 3a. Import new types
import type { TransferMoneyData, TransferResponse } from '../types';

// 3b. Add database functions
const createTransfer = async (
  data: TransferMoneyData
): Promise<TransferResponse> => {
  try {
    // Create transfer record
    const transfer = await prisma.transfers.create({
      data: {
        from_wallet_id: data.from_wallet_id,
        to_wallet_id: data.to_wallet_id,
        amount: data.amount,
        description: data.description || null,
        status: 'pending',
      },
    });

    return convertTransfer(transfer);
  } catch (error) {
    handlePrismaError(error);
  }
};

// 3c. Add helper converter function
const convertTransfer = (transfer: any): TransferResponse['transfer'] => ({
  ...transfer,
  amount: Number(transfer.amount),
  status: transfer.status as 'pending' | 'completed' | 'failed',
});

// 3d. Export function
export {
  // ... existing exports
  createTransfer,
};
```

---

### 4. **SERVICES** - Business Logic Layer

**File**: `src/modules/Financial/services/wallet.service.ts`

**Purpose**: Implement business logic and validation
**Why Fourth**: Business rules and validation logic

```typescript
// 4a. Import new types and model functions
import type { TransferMoneyData, TransferResponse } from '../types';
import { WalletModel } from '../models';

// 4b. Implement business logic
const transferMoney = async (
  data: TransferMoneyData
): Promise<TransferResponse['transfer']> => {
  // Validation
  if (data.from_wallet_id === data.to_wallet_id) {
    throw new ValidationError('Cannot transfer to the same wallet');
  }

  // Check source wallet exists and has sufficient funds
  const fromWallet = await WalletModel.findWalletById(data.from_wallet_id);
  if (!fromWallet) throw new NotFoundError('Source wallet not found');

  if (fromWallet.balance < data.amount) {
    throw new ValidationError('Insufficient funds');
  }

  // Check destination wallet exists
  const toWallet = await WalletModel.findWalletById(data.to_wallet_id);
  if (!toWallet) throw new NotFoundError('Destination wallet not found');

  // Perform transfer (this should be in a transaction)
  const transfer = await WalletModel.createTransfer(data);

  // Update wallet balances
  await WalletModel.updateWalletBalance(
    data.from_wallet_id,
    fromWallet.balance - data.amount
  );
  await WalletModel.updateWalletBalance(
    data.to_wallet_id,
    toWallet.balance + data.amount
  );

  return transfer;
};

// 4c. Export function
export {
  // ... existing exports
  transferMoney,
};
```

---

### 5. **CONTROLLERS** - Request/Response Layer

**File**: `src/modules/Financial/controllers/wallet.controller.ts`

**Purpose**: Handle HTTP requests and responses
**Why Fifth**: Controllers orchestrate the request flow

```typescript
// 5a. Import service functions
import { WalletService } from '../services';
import { successResponse } from '@/utils/response';
import type { Context } from 'hono';

// 5b. Create controller function
const transferMoney = async (c: Context) => {
  const body = await c.req.json();
  const transfer = await WalletService.transferMoney(body);
  return successResponse(
    c,
    { transfer },
    201,
    'Money transferred successfully'
  );
};

// 5c. Export function
export {
  // ... existing exports
  transferMoney,
};
```

---

### 6. **ROUTES** - API Endpoints Registration

**File**: `src/modules/Financial/routes/wallet.openapi.routes.ts`

**Purpose**: Register the new endpoint with the router
**Why Last**: Connects all layers together

```typescript
// 6a. Import new controller
import { WalletController } from '../controllers';
import { WalletSchemas } from '../schemas';

// 6b. Add route to setup function
const setupWalletRoutes = (app: OpenAPIHono) => {
  // ... existing routes

  // Add new route
  app.openapi(WalletSchemas.transferMoneyRoute, WalletController.transferMoney);
};
```

---

## Additional Considerations

### Test Data Setup

Before testing your new endpoints, you may need to create test users in the database:

```sql
-- Create a test user for API testing
INSERT INTO users (
    username,
    email,
    phone,
    password_hash
) VALUES (
    'testuser',
    'test@example.com',
    '1234567890',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW' -- password: 'secret123'
);
```

You can run this SQL command in your database client (psql, pgAdmin, etc.) to create test data for development and testing purposes.

### Error Handling

Use consistent error types throughout the application:

```typescript
import { NotFoundError, ValidationError } from '@/errors';
```

### Database Transactions

For operations affecting multiple records:

```typescript
const result = await prisma.$transaction(async (tx) => {
  // Multiple database operations
});
```

### Response Format

Use the `successResponse` helper for consistent API responses:

```typescript
return successResponse(c, data, statusCode, message);
```

### Testing

Implement comprehensive testing at each layer:

1. Unit tests for services and models
2. Integration tests for controllers
3. API tests for endpoints

---

## File Modification Order Summary

```
1. schemas/wallet.schemas.ts     - Define API contract
2. types/wallet.types.ts         - Create TypeScript types
3. models/wallet.model.ts        - Database operations
4. services/wallet.service.ts    - Business logic
5. controllers/wallet.controller.ts - Request handling
6. routes/wallet.openapi.routes.ts - Route registration
```

---

## Quick Reference Template

For a simple CRUD endpoint, follow this minimal template:

```typescript
// 1. Schema
const NewFeatureSchema = z.object({
  /* fields */
});
const newFeatureRoute = createPostRoute({
  /* config */
});

// 2. Types
type NewFeatureData = z.infer<typeof NewFeatureSchema>;

// 3. Model
const createNewFeature = async (data: NewFeatureData) => {
  /* db logic */
};

// 4. Service
const createNewFeature = async (data: NewFeatureData) => {
  /* validation + model call */
};

// 5. Controller
const createNewFeature = async (c: Context) => {
  /* parse request + service call + response */
};

// 6. Route
app.openapi(newFeatureRoute, Controller.createNewFeature);
```

This flow ensures proper separation of concerns, type safety, and maintainable code architecture.

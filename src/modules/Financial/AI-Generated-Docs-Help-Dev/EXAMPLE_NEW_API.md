# Example: Adding New API

This is a complete walkthrough of adding a new API endpoint following our development flow.

## Goal

Add a `DELETE /wallets/{walletId}` endpoint to soft-delete a wallet.

---

## Step 1: SCHEMAS - Define API Contract

**File**: `src/modules/Financial/schemas/wallet.schemas.ts`

```typescript
// Add to existing file

// 1a. Add parameter schema (reuse existing WalletIdParam)
//  Already exists: WalletIdParam

// 1b. Add response schema for delete operation
const DeleteWalletResponseSchema = z.object({
  message: z.string(),
  deletedWallet: WalletSchema,
});

// 1c. Create OpenAPI route definition
const deleteWalletRoute = createDeleteRoute({
  path: '/wallets/{walletId}',
  summary: 'Soft delete a wallet',
  params: WalletIdParam,
  tags: ['Wallets'],
});

// 1d. Add to exports
export const WalletSchemas = {
  // ... existing schemas
  DeleteWalletResponseSchema,
  deleteWalletRoute,
};
```

---

## Step 2: TYPES - Define TypeScript Types

**File**: `src/modules/Financial/types/wallet.types.ts`

```typescript
// Add to existing file

type DeleteWalletResponse = z.infer<
  typeof WalletSchemas.DeleteWalletResponseSchema
>;

export type {
  // ... existing types
  DeleteWalletResponse,
};
```

---

## Step 3: MODELS - Database Operations

**File**: `src/modules/Financial/models/wallet.model.ts`

```typescript
// Add to existing file

// 3a. Add soft delete function
const softDeleteWallet = async (id: number): Promise<Wallet> => {
  try {
    const wallet = await prisma.wallets.update({
      where: { id },
      data: {
        status: 'suspended', // Soft delete by changing status
        updated_at: new Date(),
      },
    });
    return convertWallet(wallet);
  } catch (error) {
    handlePrismaError(error);
  }
};

// 3b. Add to exports
export {
  // ... existing exports
  softDeleteWallet,
};
```

---

## Step 4: SERVICES - Business Logic

**File**: `src/modules/Financial/services/wallet.service.ts`

```typescript
// Add to existing file

// 4a. Import new types and model function
import type { DeleteWalletResponse } from '../types';

// 4b. Add business logic
const deleteWallet = async (
  walletId: number
): Promise<DeleteWalletResponse> => {
  // Check if wallet exists
  const existingWallet = await WalletModel.findWalletById(walletId);
  if (!existingWallet) {
    throw new NotFoundError('Wallet not found');
  }

  // Business rule: Can't delete wallet with positive balance
  if (existingWallet.balance > 0) {
    throw new ValidationError('Cannot delete wallet with positive balance');
  }

  // Business rule: Can't delete already suspended wallet
  if (existingWallet.status === 'suspended') {
    throw new ValidationError('Wallet is already deleted');
  }

  // Perform soft delete
  const deletedWallet = await WalletModel.softDeleteWallet(walletId);

  return {
    message: 'Wallet deleted successfully',
    deletedWallet,
  };
};

// 4c. Add to exports
export {
  // ... existing exports
  deleteWallet,
};
```

---

## Step 5: CONTROLLERS - Request Handling

**File**: `src/modules/Financial/controllers/wallet.controller.ts`

```typescript
// Add to existing file

// 5a. Add controller function
const deleteWallet = async (c: Context) => {
  const walletId = Number(c.req.param('walletId'));
  const result = await WalletService.deleteWallet(walletId);
  return successResponse(c, result, 200, 'Wallet deleted successfully');
};

// 5b. Add to exports
export {
  // ... existing exports
  deleteWallet,
};
```

---

## Step 6: ROUTES - API Registration

**File**: `src/modules/Financial/routes/wallet.openapi.routes.ts`

```typescript
// Add to existing file

const setupWalletRoutes = (app: OpenAPIHono) => {
  // ... existing routes

  // 6a. Add new route
  app.openapi(WalletSchemas.deleteWalletRoute, WalletController.deleteWallet);
};
```

---

## Testing the New Endpoint

### Test Request

```http
DELETE /wallets/123
Authorization: Bearer <token>
```

### Expected Response (Success)

```json
{
  "success": true,
  "data": {
    "message": "Wallet deleted successfully",
    "deletedWallet": {
      "id": 123,
      "owner_id": 456,
      "wallet_type": "individual",
      "organization_type": null,
      "balance": 0,
      "status": "suspended",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T12:00:00Z"
    }
  },
  "message": "Wallet deleted successfully",
  "timestamp": "2025-01-01T12:00:00Z"
}
```

### Expected Response (Error - Wallet has balance)

```json
{
  "success": false,
  "error": {
    "name": "ValidationError",
    "message": "Cannot delete wallet with positive balance",
    "statusCode": 400
  },
  "timestamp": "2025-01-01T12:00:00Z"
}
```

---

## Code Changes Summary

### Files Modified:

1. ✅ `schemas/wallet.schemas.ts` - Added delete schema and route
2. ✅ `types/wallet.types.ts` - Added delete response type
3. ✅ `models/wallet.model.ts` - Added soft delete function
4. ✅ `services/wallet.service.ts` - Added business logic with validation
5. ✅ `controllers/wallet.controller.ts` - Added controller function
6. ✅ `routes/wallet.openapi.routes.ts` - Added route registration

### Key Features Added:

- ✅ Soft delete (status change instead of hard delete)
- ✅ Business validation (can't delete wallet with balance)
- ✅ Proper error handling
- ✅ OpenAPI documentation
- ✅ Type safety throughout

---

## Next Steps

After implementation:

1. **Test the endpoint** manually or with Postman
2. **Write unit tests** for each layer
3. **Update API documentation** if needed
4. **Consider edge cases** and add more validation if required

This example demonstrates the complete flow from schema definition to working API endpoint!

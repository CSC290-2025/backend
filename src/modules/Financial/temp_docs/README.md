# Financial Module

## Overview

For now, you can create wallet, top up and use getter end-points

## Available Operations

### Wallet Management

1. **Create Wallet** - `POST /wallets`
   - Creates a new wallet for a user
   - Supports both individual and organization wallet types

2. **Get Wallet by ID** - `GET /wallets/{walletId}`
   - Retrieves a specific wallet by its ID

3. **Get User Wallets** - `GET /wallets/user/{userId}`
   - Retrieves all wallets belonging to a specific user

4. **Update Wallet** - `PUT /wallets/{walletId}`
   - Updates wallet information (type, organization type, status)

5. **Top Up Balance** - `POST /wallets/{walletId}/top-up`
   - Adds money to a wallet balance
   - Validates that the top-up amount is positive

## Module Structure

```
Financial/
├── controllers/
│   ├── index.ts
│   └── wallet.controller.ts      # Essential wallet operations only
├── models/
│   ├── index.ts
│   └── wallet.model.ts          # Database operations for wallets
├── routes/
│   ├── index.ts
│   └── wallet.openapi.routes.ts # OpenAPI routes only
├── schemas/
│   ├── index.ts
│   └── wallet.schemas.ts        # Zod schemas and OpenAPI definitions
├── services/
│   ├── index.ts
│   └── wallet.service.ts        # Business logic for wallets
├── types/
│   ├── index.ts
│   └── wallet.types.ts          # TypeScript type definitions
├── index.ts                     # Module exports
└── README.md                    # This file
```

## Development Setup

### Test Data

For testing the wallet APIs, you'll need users in your database. You can create test users with:

```sql
-- Basic test user
INSERT INTO users (username, email, phone, password_hash)
VALUES ('testuser', 'test@example.com', '1234567890', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW');

-- Additional test user for transfers/multi-user scenarios
INSERT INTO users (username, email, phone, password_hash)
VALUES ('testuser2', 'test2@example.com', '0987654321', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW');
```

_Note: Password hash is for 'secret123' - update as needed for your development environment._

## Usage

The module exports only OpenAPI routes. Import and use like this:

```typescript
import { setupWalletRoutes } from '@/modules/Financial';

// In your main app setup
setupWalletRoutes(app);
```

## API Documentation

All endpoints are documented via OpenAPI/Swagger and will appear in your API documentation automatically.

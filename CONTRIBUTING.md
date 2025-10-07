# Contributing to Smart City Backend

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Architecture Guidelines](#architecture-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Common Tasks](#common-tasks)

## Getting Started

### Prerequisites

- **Node.js:** >=20.19.0
- **pnpm:** 10.17.1 (exact version)

> [!IMPORTANT]
> Use the exact pnpm version to avoid dependency conflicts across teams.

### Initial Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/CSC290-2025/backend.git
   cd backend
   ```

2. Install dependencies:
   - Using pnpm

   ```bash
   # Using corepack (recommended)
   corepack enable
   corepack use pnpm@10.17.1

   # Or install pnpm globally
   npm install -g pnpm@10.17.1
   ```

   Afterwards,

   ```bash
   pnpm install
   ```

3. Set up environment variables

   ```bash
   cp .env.example .env
   ```

4. Run database migrations

   ```bash
   pnpm run migrate
   ```

5. Start development server

   ```bash
   pnpm run dev
   ```

## Development Workflow

### Branch Naming Convention

Use descriptive branch names with prefixes: (It's okay to name in a different format, just add `Feature` name)

- `feat/` - New features (e.g., `feat/user-authentication`)
- `fix/` - Bug fixes (e.g., `fix/login-validation`)
- `docs/` - Documentation updates (e.g., `docs/api-endpoints`)
- `refactor/` - Code refactoring (e.g., `refactor/error-handling`)
- `test/` - Adding tests (e.g., `test/user-service`)

### Making Changes

1. **Create a new branch** from `main`

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** following the [architecture guidelines](#architecture-guidelines)

3. **Test your changes**: (If there's one)

   ```bash
   pnpm run dev          # Run development server
   pnpm run test         # Run tests
   pnpm run type-check   # Check TypeScript types
   pnpm run check        # Run linting and formatting checks
   ```

4. **Commit your changes** with clear, descriptive messages

   ```bash
   git add .
   git commit -m "feat: add user authentication endpoint"
   ```

5. **Push to your branch**

   ```bash
   git push origin feat/your-feature-name
   ```

6. **Create a Pull Request** using the provided template

## Code Standards

### Formatting & Linting

We use **Prettier** and **ESLint** with automatic formatting on commit.

> [!NOTE]
> These checks are enforced by pre-commit hooks, but run them manually to catch issues early.

```bash
pnpm run format      # Format all files
pnpm run lint        # Check for linting errors
pnpm run lint:fix    # Auto-fix linting errors
pnpm run check       # Run both ESLint and Prettier checks
```

### Code Style

- Use **camelCase** for variables and functions
- Use **PascalCase** for types, interfaces, and classes
- Use **kebab-case** for file names
- Use **descriptive names** (avoid single-letter variables except in loops)
- Add **JSDoc comments** for complex functions
- Keep functions **small and focused** (single responsibility)

### Import Organization

Use path aliases for cleaner imports:

```typescript
// ✅ Good
import { UserModel } from '@/models';
import type { User } from '@/types';

// ❌ Bad
import { UserModel } from '../../../models';
import type { User } from '../../../types/user.types';
```

Import order:

1. External packages
2. Internal aliases (`@/...`)
3. Relative imports
4. Type imports (grouped separately with `type`)

## Architecture Guidelines

Following a **modular architecture**, please refer to the [Architecture Guide](./docs/ARCHITECTURE_GUIDE.md) for detailed patterns.

### Quick Reference

Folder structure

```tree
src/
├── modules/
│   └── [feature]/
│       ├── types/        # TypeScript interfaces
│       ├── models/       # Database operations
│       ├── services/     # Business logic
│       ├── controllers/  # HTTP request handlers
│       └── routes/       # Route definitions
├── middlewares/          # Global middleware
├── errors/               # Custom error classes
└── utils/                # Shared utilities
```

Layer responsibilities

- **Types**: Define data structures and interfaces
- **Models**: Direct database interactions (Prisma queries)
- **Services**: Business logic and validation
- **Controllers**: Handle HTTP requests/responses
- **Routes**: Define API endpoints

Flow

```text
Routes → Controllers → Services → Models → Database
```

### Creating a New Feature

1. Create folder structure in `src/modules/[feature]/`
2. Define types in `types/[feature].types.ts`
   -It's `types`, but can be changed to your likings, `types` or `type` or whatever
   -Just DON'T EDIT THE EXAMPLE FILES FOR NOW PLEASE.
3. Implement database operations in `models/[feature].model.ts`
4. Add business logic in `services/[feature].service.ts`
5. Create controllers in `controllers/[feature].controller.ts`
6. Define routes in `routes/[feature].routes.ts`
7. Export from `index.ts` files at each level

See the `src/modules/_example/` folder for a complete reference implementation.

### Error Handling

Use custom error classes from `@/errors`:

```typescript
import { NotFoundError, ValidationError } from '@/errors';

// In services:
if (!user) throw new NotFoundError('User not found');
if (!email.includes('@')) throw new ValidationError('Invalid email');
```

See [Error Handling Guide](./docs/ERROR_HANDLING.md) for more details.

### Response Format

Use the standard success response helper:

```typescript
import { successResponse } from '@/utils/response';

return successResponse(c, { user }, 200, 'User retrieved successfully');
```

See [Success Responses Guide](./docs/SUCCESS_RESPONSES.md) for more details.

## Pull Request Process

1. Make sure code quality checks succeed
2. Update documentation if needed
3. Request review from team members & the Leads
4. Let the Leads review & handle the merging process

See the [Pull Request Guide](./.github/PULL_REQUEST_GUIDE.md) for detailed instructions.

## Testing

### Running Tests (If there is, in your feature(s))

```bash
pnpm run test
```

### Writing Tests

- Place tests next to the files they test (e.g., `user.service.test.ts`)
- Use descriptive test names that explain the scenario
- Follow the AAA pattern: Arrange, Act, Assert
- Mock external dependencies (database, APIs, etc.)

Example -

```typescript
import { describe, it, expect } from 'vitest';
import { UserService } from './user.service';

describe('UserService.getUserById', () => {
  it('should return user when found', async () => {
    // Arrange
    const mockId = '123';

    // Act
    const user = await UserService.getUserById(mockId);

    // Assert
    expect(user).toBeDefined();
    expect(user.id).toBe(mockId);
  });
});
```

Refer to this [Website](https://arrangeactassert.com/what-is-aaa/) if you wanna learn more.

## Common Tasks

### Adding a Database Model

1. Update `prisma/schema.prisma`
2. Run migration:

   ```bash
   pnpm run migrate
   ```

### Adding Environment Variables

1. Add to `.env`
2. Update `src/config/env.ts` for type safety

## Getting Help

> [!TIP]
> When stuck, follow this order for quick resolution.

- Check existing [documentation](./docs/) Or the [Dedicated repository](https://github.com/CSC290-2025/docs)
- Review the [example module](./src/modules/_example/)
- Ask in your team's communication channel
- Ask the Leads
- Open an issue for bugs or feature requests

# Contributing Guidelines

## Table of Contents

- [Getting Started](#getting-started)
- [Daily Workflow](#daily-workflow)
- [Branch Naming](#branch-naming-convention)
- [Code Standards](#code-standards)
- [Architecture Guidelines](#architecture-guidelines)
- [Pull Request Process](#pull-request-process)
- [Dev Commands](#dev-commands-can-omit-run)
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

## Daily Workflow

> [!TIP]
> Follow this workflow every day to stay in sync and maintain code quality.

### Start of Day

1. **Pull latest changes**

   ```bash
   git pull origin main
   ```

2. **Install/update dependencies**

   ```bash
   pnpm install
   ```

3. Set up environment variables

   ```bash
   cp .env.example .env
   ```

4. **Update database schema** (if needed or schema is updated)

> [!CAUTION]
> Always run migrations when schema changes are pulled! (i.e. `schema.prisma`)

```bash
pnpm run migrate
```

5. Start development server

   ```bash
   pnpm run dev
   ```

### During Development

#### Creating a Feature Branch

```bash
git checkout -b feature/[feature-name]
# or
git checkout -b fix/[bug-fix]
```

#### Staying in Sync (Do this frequently!)

**Merge workflow:**

```bash
# Fetch latest main and merge into your branch
git fetch origin main
git merge origin/main
```

**When to sync:**

- Before starting work each day
- Before creating a PR
- When main has important updates
- If your branch is getting behind

#### Before Committing

1. **Run type checking**

   ```bash
   pnpm type-check
   ```

2. **Run linting and formatting**

   ```bash
   pnpm check
   ```

3. **Run tests** (If tests are available for specific features)

   ```bash
   pnpm test
   ```

#### Committing Changes

```bash
git add .
git commit -m "type: concise description of changes"
# (e.g. git commit -m "feat: add new user type")
```

> [!NOTE]
> **Commit message format:** (If possible, please use [Conventional Commits](https://www.conventionalcommits.org/))
>
> - `feat:` - new feature
> - `fix:` - bug fix
> - `refactor:` - code refactoring
> - `docs:` - documentation changes
> - `test:` - adding or updating tests
> - `chore:` - housekeeping tasks (no new functions or feats)

### End of Day

1. **Push your branch**

   ```bash
   git push origin your-branch-name
   ```

2. **Create pull request** (if feature is complete or Once a week)

## Branch Naming Convention

Use descriptive branch names with prefixes: (It's okay to name in a different format, just don't forget to add `Feature` name)

- `feat/` - New features (e.g., `feat/user-authentication`)
- `fix/` - Bug fixes (e.g., `fix/login-validation`)
- `docs/` - Documentation updates (e.g., `docs/api-endpoints`)
- `refactor/` - Code refactoring (e.g., `refactor/error-handling`)
- `test/` - Adding tests (e.g., `test/user-service`)

## Code Standards

### Formatting & Linting

> [!TIP]
> Code quality is automatically enforced, but understanding the tools helps debug issues.

- **Pre-commit hooks** are configured with Husky and lint-staged
- **ESLint** and **Prettier** will auto-fix on commits

> [!NOTE]
> Ping @psst on discord if any error shows up

- **TypeScript** only for consistency across frontend & backend

### Code Style

- Use **camelCase** for variables and functions
- Use **PascalCase** for types, interfaces, and classes
- Use **kebab-case** for file names
- Use **descriptive names** (avoid single-letter variables except in loops)
- Add **JSDoc comments** for complex functions (If applicable) [Reference](https://jsdoc.app/)
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

#### Folder structure

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

#### Layer responsibilities

- **Types**: Define data structures and interfaces
- **Models**: Direct database interactions (Prisma queries)
- **Services**: Business logic and validation
- **Controllers**: Handle HTTP requests/responses
- **Routes**: Define API endpoints

#### Flow

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
7. Export from `index.tsx` files at each level

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

See [Success Responses Guide](./docs/SUCCESS_RESPONSES.md) for more details

## Tech Stack

### Hono & Node.js

### Prisma

> [!CAUTION]
> **Schema changes:** Always create migrations - never modify the database directly!

```bash
pnpm migrate
```

- **Database queries:** Use proper error handling (more at [Error Handling Guide](./docs/ERROR_HANDLING.md))

## Dev Commands (Can omit `run`)

| Command               | Purpose                                  |
| --------------------- | ---------------------------------------- |
| `pnpm run dev`        | Start development server with hot reload |
| `pnpm run build`      | Build for production                     |
| `pnpm run start`      | Start production server                  |
| `pnpm run migrate`    | Run database migrations                  |
| `pnpm run type-check` | Check TypeScript types                   |
| `pnpm run lint`       | Lint code                                |
| `pnpm run lint:fix`   | Lint and auto-fix issues                 |
| `pnpm run format`     | Format code with Prettier                |
| `pnpm run check`      | Run both linting and format checking     |
| `pnpm run test`       | Run tests                                |

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

Refer to this [website](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices) if you wanna learn more.

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

# Database Seeding

## Overview

Seed files populate the database with initial data. All seed files are located in this directory.

## Available Seeds

### Roles Seed (`roles.seed.ts`)

Populates the `roles` table with all system-wide roles defined in `src/constants/roles.ts`.

**Roles seeded:**

- Admin
- Moderator
- Traffic Manager
- Emergency Manager
- Health Manager
- Waste Manager
- Volunteer Coordinator
- Event Organizer
- Financial Manager
- Apartment Manager
- Weather Analyst
- Citizen

### Users Seed (`users.seed.ts`)

Creates test users for development.

## How to Use

```bash
# Seed only roles
pnpm seed:roles

# Seed only users
pnpm seed

# Seed roles and users
pnpm seed:all
```

## Adding New Roles

1. Add the role to `src/constants/roles.ts`
2. Add the mapping in `prisma/roles.seed.ts`
3. Run `pnpm seed:roles`

## Notes

- Seeds are idempotent (safe to run multiple times)
- Roles with existing IDs won't be duplicated

import type { z } from 'zod';
import type {
  UserSchema,
  CreateUserSchema,
  UserIdParam,
  UserQuery,
} from '@/schemas/user.schemas';

type User = z.infer<typeof UserSchema>;

type CreateUserData = z.infer<typeof CreateUserSchema>;

type UpdateUserData = Partial<CreateUserData>;

type UserIdParams = z.infer<typeof UserIdParam>;

type UserQueryParams = z.infer<typeof UserQuery> & {
  sortBy?: 'name' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
};

type PaginatedUsers = {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type {
  User,
  CreateUserData,
  UpdateUserData,
  UserIdParams,
  UserQueryParams,
  PaginatedUsers,
};

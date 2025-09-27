interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateUserData {
  email: string;
  name: string;
  avatar?: string;
}

interface UpdateUserData {
  email?: string;
  name?: string;
  avatar?: string;
}

interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedUsers {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export type {
  User,
  CreateUserData,
  UpdateUserData,
  UserQueryParams,
  PaginatedUsers,
};

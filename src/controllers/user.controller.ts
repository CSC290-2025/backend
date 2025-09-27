import type { Context } from 'hono';
import { UserService } from '@/services';
import { successResponse } from '@/utils/response';
import { ValidationError } from '@/errors';

// GET /users/:id - Get user by ID
const getUser = async (c: Context) => {
  const id = c.req.param('id');
  const user = await UserService.getUserById(id);
  return successResponse(c, { user });
};

// GET /users - Get all users with pagination
const getUsers = async (c: Context) => {
  const page = Number(c.req.query('page')) || 1;
  const limit = Number(c.req.query('limit')) || 10;
  const search = c.req.query('search');
  const sortBy =
    (c.req.query('sortBy') as 'name' | 'email' | 'createdAt') || 'createdAt';
  const sortOrder = (c.req.query('sortOrder') as 'asc' | 'desc') || 'desc';

  const result = await UserService.getAllUsers({
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  });

  return successResponse(c, result);
};

// POST /users - Create new user
const createUser = async (c: Context) => {
  const body = await c.req.json();
  const user = await UserService.createUser(body);
  return successResponse(c, { user }, 201, 'User created successfully');
};

// PUT /users/:id - Update user
const updateUser = async (c: Context) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const user = await UserService.updateUser(id, body);
  return successResponse(c, { user }, 200, 'User updated successfully');
};

// DELETE /users/:id - Delete user
const deleteUser = async (c: Context) => {
  const id = c.req.param('id');
  await UserService.deleteUser(id);
  return successResponse(c, null, 200, 'User deleted successfully');
};

// GET /users/search?q=query - Search users
const searchUsers = async (c: Context) => {
  const query = c.req.query('q');
  if (!query) {
    throw new ValidationError('Search query is required');
  }

  const page = Number(c.req.query('page')) || 1;
  const limit = Number(c.req.query('limit')) || 10;

  const result = await UserService.searchUsers(query, { page, limit });
  return successResponse(c, result, 200, `Found ${result.users.length} users`);
};

// GET /users/email/:email - Get user by email
const getUserByEmail = async (c: Context) => {
  const email = c.req.param('email');
  const user = await UserService.getUserByEmail(email);
  return successResponse(c, { user });
};

export {
  getUser,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  getUserByEmail,
};

import { z } from 'zod';
import { createPostRoute } from '@/utils/openapi-helpers';

// Zod schemas
const LoginRequestSchema = z.object({
  email: z.string().email(), // Enforcing valid email format
  password: z.string(),
});

const AuthResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.number(),
    email: z.string(),
    role: z.string(),
    name: z.string().optional(),
  }),
});

const AddStaffRequestSchema = z.object({
  email: z.string().email(),
  role: z.string().default('admin'),
  facilityId: z.number().optional(),
});

const AddStaffResponseSchema = z.object({
  message: z.string(),
});

// OpenAPI route definitions
const loginRoute = createPostRoute({
  path: '/api/healthcare/auth/login',
  summary: 'Healthcare Staff Login',
  requestSchema: LoginRequestSchema,
  responseSchema: AuthResponseSchema,
  tags: ['Auth'],
});

const addStaffRoute = createPostRoute({
  path: '/api/healthcare/auth/staff',
  summary: 'Add Validation Staff/Admin',
  requestSchema: AddStaffRequestSchema,
  responseSchema: AddStaffResponseSchema,
  tags: ['Auth'],
  // Note: Security requirement should be added here ideally, but handled in middleware
});

export const AuthSchemas = {
  LoginRequestSchema,
  AuthResponseSchema,
  AddStaffRequestSchema,
  AddStaffResponseSchema,
  loginRoute,
  addStaffRoute,
};

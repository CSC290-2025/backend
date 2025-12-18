import type { Context } from 'hono';
import { sign } from 'hono/jwt';
import { successResponse, errorResponse } from '@/utils/response'; // Assuming errorResponse exists or I should use throw
import { UnauthorizedError, NotFoundError, ConflictError } from '@/errors';
import prisma from '@/config/client';
import { ROLES } from '@/constants/roles';
import { AuthSchemas } from '../schemas/auth.schemas';
import bcrypt from 'bcryptjs';

const SECRET_KEY = process.env.JWT_SECRET || 'healthcare-secret-key-change-me';

const login = async (c: Context) => {
  const payload = await c.req.json();
  const { email, password } = AuthSchemas.LoginRequestSchema.parse(payload);

  // Check Database Users & Staff
  // First find the user
  const dbUser = await prisma.users.findFirst({
    where: {
      OR: [{ email: email }, { username: email }],
    },
    include: {
      roles: true,
    },
  });

  if (!dbUser) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Verify Password
  const isValidPassword = await bcrypt.compare(password, dbUser.password_hash);
  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid credentials');
  }

  let roleName = dbUser.roles?.role_name || '';
  if (!roleName && dbUser.role_id) {
    const roleRecord = await prisma.roles.findUnique({
      where: { id: dbUser.role_id },
    });
    roleName = roleRecord?.role_name || '';
  }
  const allowedRoles = [ROLES.HEALTH_MANAGER].map((role) => role.toLowerCase());
  if (!allowedRoles.includes(roleName.toLowerCase())) {
    throw new UnauthorizedError('Access denied. Health manager role required.');
  }

  // Generate Token
  const token = await sign(
    {
      id: dbUser.id,
      email: dbUser.email,
      role: roleName,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
    },
    SECRET_KEY
  );

  return successResponse(c, {
    token,
    user: {
      id: dbUser.id,
      email: dbUser.email,
      role: roleName,
      name: (dbUser as any).username || (dbUser as any).name,
    },
  });
};

const addStaff = async (c: Context) => {
  // Extract user info from token (middleware should have placed it in c.get('jwtPayload') or similar,
  // but for now we assume the route is protected and we can trust the caller or verify here if needed)
  // For simplicity using Hono's jwt middleware in routes/index usually puts payload in c.var.jwtPayload

  // Note: Request validation happens via Zod validator in route definition usually, or manually here.
  const payload = await c.req.json();
  const { email, role, facilityId } =
    AuthSchemas.AddStaffRequestSchema.parse(payload);

  // Find target user
  const targetUser = await prisma.users.findUnique({
    where: { email },
  });

  if (!targetUser) {
    throw new NotFoundError(
      `User with email ${email} not found. Please ensure they are registered first.`
    );
  }

  // Check if already staff
  const existingStaff = await prisma.staff.findFirst({
    where: { user_id: targetUser.id },
  });

  if (existingStaff) {
    throw new ConflictError('User is already a staff member.');
  }

  // Create Staff
  await prisma.staff.create({
    data: {
      user_id: targetUser.id,
      role: role,
      facility_id: facilityId || null,
    },
  });

  return successResponse(c, { message: 'Staff added successfully' }, 201);
};

export { login, addStaff };

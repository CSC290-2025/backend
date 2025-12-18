import type { Context } from 'hono';
import { sign } from 'hono/jwt';
import { successResponse, errorResponse } from '@/utils/response'; // Assuming errorResponse exists or I should use throw
import { UnauthorizedError, NotFoundError, ConflictError } from '@/errors';
import prisma from '@/config/client';
import { AuthSchemas } from '../schemas/auth.schemas';
import bcrypt from 'bcryptjs';

const SECRET_KEY = process.env.JWT_SECRET || 'healthcare-secret-key-change-me';

// Hardcoded Admin
const HARDCODED_ADMIN = {
  email: 'admin@healthcare.com',
  password: 'admin123',
  id: -1,
  role: 'super_admin',
};

const login = async (c: Context) => {
  const payload = await c.req.json();
  const { email, password } = AuthSchemas.LoginRequestSchema.parse(payload);

  let user = null;
  let role = '';

  // 1. Check Hardcoded Admin
  if (
    email === HARDCODED_ADMIN.email &&
    password === HARDCODED_ADMIN.password
  ) {
    user = {
      id: HARDCODED_ADMIN.id,
      email: HARDCODED_ADMIN.email,
      username: 'Healthcare Admin',
    };
    role = HARDCODED_ADMIN.role;
  } else {
    // 2. Check Database Users & Staff
    // First find the user
    const dbUser = await prisma.users.findFirst({
      where: {
        OR: [{ email: email }, { username: email }],
      },
    });

    if (!dbUser) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify Password
    const isValidPassword = await bcrypt.compare(
      password,
      dbUser.password_hash
    );
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if they are authorized 'staff'
    const staffRecord = await prisma.staff.findFirst({
      where: { user_id: dbUser.id },
    });

    if (!staffRecord) {
      throw new UnauthorizedError(
        'Access denied. Not a healthcare staff member.'
      );
    }

    user = dbUser;
    role = staffRecord.role || 'staff';
  }

  // Generate Token
  const token = await sign(
    {
      id: user.id,
      email: user.email,
      role: role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
    },
    SECRET_KEY
  );

  return successResponse(c, {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: role,
      name: (user as any).username || (user as any).name, // handle hardcoded vs db user structure
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

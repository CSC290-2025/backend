import { withAccelerate } from '@prisma/extension-accelerate';
import type { PrismaClient as BasePrismaClient } from '@/generated/prisma';

type AcceleratedPrismaClient = ReturnType<BasePrismaClient['$extends']>;

let prisma: AcceleratedPrismaClient;

try {
  const { PrismaClient } = await import('@/generated/prisma');
  prisma = new PrismaClient().$extends(withAccelerate());
} catch (_err) {
  console.warn(
    [
      'Prisma client not found.',
      'You likely need to run: `pnpx prisma generate`',
      'If this is a fresh clone, also ensure `.env` is configured correctly.',
    ].join('\n')
  );

  throw new Error(
    "Prisma client not found. Please run 'pnpx prisma generate' before starting the server."
  );
}

export default prisma;

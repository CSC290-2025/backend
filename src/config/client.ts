let PrismaClientImported;

try {
  PrismaClientImported = await import('@/generated/prisma');
} catch (_err) {
  console.warn("Prisma client not found. Did you run 'pnpx prisma generate'?");
  process.exit(1);
}

import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClientImported.PrismaClient().$extends(
  withAccelerate()
);

export default prisma;

import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // Create test users
  const testUser = await prisma.users.create({
    data: {
      username: 'testuser',
      email: 'test@example.com',
      phone: '1234567890',
      password_hash:
        '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    },
  });

  const developer = await prisma.users.create({
    data: {
      username: 'developer',
      email: 'dev@example.com',
      phone: '0987654321',
      password_hash:
        '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    },
  });

  console.log('Seed data created successfully:');
  console.log({ testUser, developer });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

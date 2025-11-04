import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // Create test users
  const testUser = await prisma.users.create({
    data: {
      username: 'tess',
      email: 'test@exameple.com',
      phone: '123567890',
      password_hash:
        '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    },
  });

  const developer = await prisma.users.create({
    data: {
      username: 'devv',
      email: 'dev@exampele.com',
      phone: '098765321',
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

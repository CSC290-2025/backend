import { PrismaClient } from '../src/generated/prisma';
import { ROLES } from '../src/constants/roles';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Starting roles seed...');

    // Seed all roles from ROLES constant
    const rolesToSeed = Object.values(ROLES);

    // Upsert all roles
    for (const roleName of rolesToSeed) {
      const existingRole = await prisma.roles.findUnique({
        where: { role_name: roleName },
      });

      if (!existingRole) {
        await prisma.roles.create({
          data: { role_name: roleName },
        });
      }
      console.log(`✓ ${roleName}`);
    }

    console.log('✓  Roles seed completed successfully!\n');
  } catch (error) {
    console.error('❌ Error seeding roles:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

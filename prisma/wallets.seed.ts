import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const volunteerWallet = await prisma.wallets.create({
    data: {
      wallet_type: 'organization',
      organization_type: 'Volunteer',
      balance: 0,
      status: 'active',
    },
  });

  const transportationWallet = await prisma.wallets.create({
    data: {
      wallet_type: 'organization',
      organization_type: 'Transportation',
      balance: 0,
      status: 'active',
    },
  });

  const healthcareWallet = await prisma.wallets.create({
    data: {
      wallet_type: 'organization',
      organization_type: 'Healthcare',
      balance: 0,
      status: 'active',
    },
  });

  console.log('Organization wallets created successfully:');
  console.log({ volunteerWallet, transportationWallet, healthcareWallet });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

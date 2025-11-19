import prisma from '../../config/client';

// --- Configuration ---
const NUM_WASTE_TYPES = 10;
const NUM_EVENTS = 20;
const STATS_PER_EVENT = 5;
const REPORTS_PER_STAT = 2;

// --- Helper Functions ---
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number, decimals = 2) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const randomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
const randomDate = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// --- Realistic Data Arrays ---
const wasteTypeNames = [
  'Plastic Bottles',
  'Cardboard',
  'Glass',
  'Aluminum Cans',
  'Food Scraps',
  'Yard Waste',
  'Electronics',
  'Batteries',
  'Paper',
  'Textiles',
];
const reportTypes = [
  'Daily Summary',
  'Weekly Trend',
  'Monthly Analysis',
  'Anomaly Report',
];

async function main() {
  console.log('Starting to seed waste data...');

  // 1. Clean up existing data
  console.log('Cleaning up old waste data...');
  await prisma.power_bi_reports.deleteMany({
    where: { report_type: { in: reportTypes } },
  });
  await prisma.waste_event_statistics.deleteMany({});
  await prisma.waste_types.deleteMany({
    where: { type_name: { in: wasteTypeNames } },
  });
  // Also cleaning up events created by this seeder to avoid conflicts
  await prisma.events.deleteMany({
    where: { title: { contains: '(WasteSeed)' } },
  });

  // 2. Create foundational data (Waste Types and Events)
  console.log('Creating foundational data (waste types, events)...');

  const wasteTypes = [];
  for (let i = 0; i < NUM_WASTE_TYPES; i++) {
    wasteTypes.push(
      await prisma.waste_types.create({
        data: {
          type_name: wasteTypeNames[i] || `Waste Type ${i}`,
          typical_weight_kg: randomFloat(0.1, 5),
        },
      })
    );
  }
  console.log(`Created ${wasteTypes.length} waste types.`);

  // Fetch existing users and addresses to associate with events
  const users = await prisma.users.findMany({ take: 50 });
  const addresses = await prisma.addresses.findMany({ take: 50 });

  if (users.length === 0 || addresses.length === 0) {
    console.error(
      'Could not find existing users or addresses. Please run other seeders first.'
    );
    process.exit(1);
  }

  const events = [];
  for (let i = 0; i < NUM_EVENTS; i++) {
    events.push(
      await prisma.events.create({
        data: {
          title: `Community Cleanup #${i + 1} (WasteSeed)`,
          description: 'A community event to collect and sort local waste.',
          host_user_id: randomItem(users).id,
          address_id: randomItem(addresses).id,
          start_at: randomDate(new Date(2023, 0, 1), new Date()),
          end_at: randomDate(new Date(), new Date(2025, 11, 31)),
          total_seats: randomInt(20, 100),
        },
      })
    );
  }
  console.log(`Created ${events.length} waste-related events.`);

  // 3. Create Waste Event Statistics
  console.log('Creating waste event statistics...');
  const wasteStats = [];
  for (const event of events) {
    for (let i = 0; i < STATS_PER_EVENT; i++) {
      wasteStats.push(
        await prisma.waste_event_statistics.create({
          data: {
            event_id: event.id,
            waste_type_id: randomItem(wasteTypes).id,
            collection_date: event.start_at,
            total_collection_weight: randomFloat(10, 500),
          },
        })
      );
    }
  }
  console.log(`Created ${wasteStats.length} waste event statistics.`);

  // 4. Create Power BI Reports
  console.log('Creating Power BI reports...');
  const powerBiReports = [];
  for (const stat of wasteStats) {
    for (let i = 0; i < REPORTS_PER_STAT; i++) {
      powerBiReports.push({
        waste_event_statistic_id: stat.id,
        report_type: randomItem(reportTypes),
        report_date: stat.collection_date,
      });
    }
  }
  await prisma.power_bi_reports.createMany({ data: powerBiReports });
  console.log(`Created ${powerBiReports.length} Power BI reports.`);

  console.log('Waste data seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('An error occurred during waste seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

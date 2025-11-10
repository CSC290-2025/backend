import prisma from '../../config/client'; // Assumes your client path

// --- Configuration Constants ---
const TOTAL_DAYS = 365; // 1 year of data
const NUM_FACTS_PER_TABLE = 5000; // Number of fact records to create for most tables
const TOTAL_FACILITIES = 50; // Total number of healthcare facilities
const TOTAL_USERS = 20; // Total number of analyst users

// --- Helper Functions ---

/**
 * Generates a random integer between min and max (inclusive).
 */
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random float between min and max.
 */
function randomFloat(min: number, max: number, decimals: number = 2) {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);
  return parseFloat(str);
}

/**
 * Gets a random item from an array.
 */
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- Realistic Data Arrays ---

const locationNames = [
  'Sathorn', // Commercial
  'Watthana', // Commercial
  'Pathum Wan', // Commercial
  'Ratchathewi', // Commercial
  'Khlong Toei', // Commercial
  'Bang Rak', // Commercial
  'Chatuchak',
  'Bangkapi',
  'Phra Nakhon',
  'Yannawa',
  'Dusit',
  'Phasi Charoen',
  'Bang Khen',
  'Lat Phrao',
  'Huai Khwang',
  'Thon Buri',
  'Bang Kho Laem',
  'Suan Luang',
  'Din Daeng',
  'Prawet',
];

// List of commercial hubs for realistic traffic/waste data
const commercialHubs = [
  'Sathorn',
  'Watthana',
  'Pathum Wan',
  'Ratchathewi',
  'Khlong Toei',
  'Bang Rak',
];

const facilityTypes = [
  'General Hospital',
  'Clinic',
  'Health Center',
  'Medical Lab',
  'Wellness Center',
];

const userNames = [
  'Somchai',
  'Somsak',
  'Preecha',
  'Arun',
  'Kamon',
  'Niran',
  'Somporn',
  'Sunan',
  'Anong',
  'Malee',
  'Siriporn',
  'Aree',
  'Rattana',
  'Jintana',
  'Supaporn',
  'Chai',
  'Boonmee',
  'Patchara',
  'Thong-ek',
  'Apiradee',
];

const wasteTypeNames = [
  'General',
  'Recyclable',
  'Hazardous',
  'Organic',
  'Electronic',
];

const categoryNames = [
  'Healthcare',
  'Traffic',
  'Waste Management',
  'Environment',
  'Population',
];

// --- Main Seeding Function ---

async function main() {
  console.log('Start seeding data warehouse tables...');

  // 1. Clean up DW tables in dependency-safe order (Facts first)
  console.log('Cleaning existing data...');
  await prisma.fact_healthcare.deleteMany({});
  await prisma.fact_population.deleteMany({});
  await prisma.fact_traffic.deleteMany({});
  await prisma.fact_waste.deleteMany({});
  await prisma.fact_weather.deleteMany({});

  await prisma.dim_facility.deleteMany({});
  await prisma.dim_location.deleteMany({});
  await prisma.dim_time.deleteMany({});
  await prisma.dim_user.deleteMany({});
  await prisma.dim_waste_type.deleteMany({});
  await prisma.dim_category.deleteMany({});

  // 2. Create Dimensions
  // (We create these one-by-one to get the returned objects,
  // which we need for the realistic data patterning. This is fast.)
  console.log('Creating dimensions...');

  // --- Create dim_time (365 days) ---
  const timeDims = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - TOTAL_DAYS); // Go back 1 year

  for (let i = 1; i <= TOTAL_DAYS; i++) {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() + i);

    timeDims.push(
      await prisma.dim_time.create({
        data: {
          time_id: i,
          date_actual: newDate,
          year_val: newDate.getFullYear(),
          month_val: newDate.getMonth() + 1, // JS months are 0-11
          day_val: newDate.getDate(),
          hour_val: null, // Representing a full day aggregate
        },
      })
    );
  }
  console.log(`Created ${timeDims.length} time records.`);

  // --- Create dim_location (20 districts) ---
  const locationDims = [];
  for (let i = 0; i < locationNames.length; i++) {
    locationDims.push(
      await prisma.dim_location.create({
        data: {
          location_id: i + 1,
          district: locationNames[i],
        },
      })
    );
  }
  console.log(`Created ${locationDims.length} location records.`);

  // --- Create dim_waste_type ---
  const wasteTypeDims = [];
  for (let i = 0; i < wasteTypeNames.length; i++) {
    wasteTypeDims.push(
      await prisma.dim_waste_type.create({
        data: {
          waste_type_id: i + 1,
          waste_type_name: wasteTypeNames[i],
        },
      })
    );
  }
  console.log(`Created ${wasteTypeDims.length} waste type records.`);

  // --- Create dim_facility (50 facilities) ---
  const facilityDims = [];
  for (let i = 1; i <= TOTAL_FACILITIES; i++) {
    const randomLocation = randomItem(locationDims);
    const randomType = randomItem(facilityTypes);
    facilityDims.push(
      await prisma.dim_facility.create({
        data: {
          facility_id: i,
          facility_name: `${randomLocation.district} ${randomType}`,
          location_id: randomLocation.location_id,
        },
      })
    );
  }
  console.log(`Created ${facilityDims.length} facility records.`);

  // --- Create dim_user (20 users) ---
  const userDims = [];
  for (let i = 1; i <= TOTAL_USERS; i++) {
    userDims.push(
      await prisma.dim_user.create({
        data: {
          user_id: i,
          full_name: userNames[i - 1] || `Analyst User ${i}`,
          email: `${
            userNames[i - 1]?.toLowerCase().split(' ')[0]
          }@smartcity.com`,
          role_string: 'Analyst',
        },
      })
    );
  }
  console.log(`Created ${userDims.length} user records.`);

  // --- Create dim_category ---
  const categoryDims = [];
  for (let i = 0; i < categoryNames.length; i++) {
    categoryDims.push(
      await prisma.dim_category.create({
        data: {
          category_id: i + 1,
          category_name: categoryNames[i],
          category_description: `Reports related to ${categoryNames[i]}`,
        },
      })
    );
  }
  console.log(`Created ${categoryDims.length} category records.`);

  // 3. Create Facts (Using createMany for speed)
  console.log(`Creating ${NUM_FACTS_PER_TABLE} records for each fact table...`);

  // --- Create fact_healthcare ---
  const healthcareFacts = [];
  for (let i = 1; i <= NUM_FACTS_PER_TABLE; i++) {
    const randomFacility = randomItem(facilityDims);
    let avg_wait_time_minutes_numeric: number;
    let bed_occupancy_percent_numeric: number;

    if (randomFacility.facility_name.includes('Hospital')) {
      avg_wait_time_minutes_numeric = randomFloat(30, 120);
      bed_occupancy_percent_numeric = randomFloat(70, 100);
    } else {
      avg_wait_time_minutes_numeric = randomFloat(5, 45);
      bed_occupancy_percent_numeric = randomFloat(10, 50);
    }

    healthcareFacts.push({
      health_id: i,
      time_id: randomItem(timeDims).time_id,
      facility_id: randomFacility.facility_id,
      avg_wait_time_minutes_numeric,
      bed_occupancy_percent_numeric,
      total_revenue_numeric: randomFloat(50000, 1500000),
    });
  }
  await prisma.fact_healthcare.createMany({ data: healthcareFacts });
  console.log(`Created ${healthcareFacts.length} healthcare facts.`);

  // --- Create fact_population (Monthly per District) ---
  // (This logic is custom and already fast, so we keep it)
  let pop_id = 1;
  const populationFacts = [];
  for (const location of locationDims) {
    for (let month = 1; month <= 12; month++) {
      const timeRecord = timeDims.find(
        (t) => t.month_val === month && t.day_val === 1
      );
      if (!timeRecord) continue;

      populationFacts.push(
        prisma.fact_population.create({
          data: {
            population_id: pop_id++,
            time_id: timeRecord.time_id,
            location_id: location.location_id,
            total_population: randomInt(40000, 250000),
            population_density_numeric: randomFloat(1000, 8000),
            median_age_numeric: randomFloat(32, 48),
          },
        })
      );
    }
  }
  await Promise.all(populationFacts);
  console.log(`Created ${populationFacts.length} population facts.`);

  // --- Create fact_traffic ---
  const trafficFacts = [];
  for (let i = 1; i <= NUM_FACTS_PER_TABLE; i++) {
    const randomLocation = randomItem(locationDims);
    let vehicle_count: number;
    let has_accident_flag: boolean;

    if (commercialHubs.includes(randomLocation.district)) {
      vehicle_count = randomInt(5000, 15000);
      has_accident_flag = Math.random() < 0.2;
    } else {
      vehicle_count = randomInt(1000, 4500);
      has_accident_flag = Math.random() < 0.08;
    }

    trafficFacts.push({
      traffic_id: i,
      time_id: randomItem(timeDims).time_id,
      location_id: randomLocation.location_id,
      vehicle_count,
      has_accident_flag,
      density_level_numeric: randomFloat(1, 10),
    });
  }
  await prisma.fact_traffic.createMany({ data: trafficFacts });
  console.log(`Created ${trafficFacts.length} traffic facts.`);

  // --- Create fact_waste ---
  const wasteFacts = [];
  for (let i = 1; i <= NUM_FACTS_PER_TABLE; i++) {
    const randomLocation = randomItem(locationDims);
    const randomWasteType = randomItem(wasteTypeDims);
    let collection_weight_kg_numeric: number;

    if (
      commercialHubs.includes(randomLocation.district) &&
      randomWasteType.waste_type_name === 'Recyclable'
    ) {
      collection_weight_kg_numeric = randomFloat(1000, 5000);
    } else if (
      !commercialHubs.includes(randomLocation.district) &&
      randomWasteType.waste_type_name === 'Organic'
    ) {
      collection_weight_kg_numeric = randomFloat(800, 4000);
    } else if (
      ['Hazardous', 'Electronic'].includes(randomWasteType.waste_type_name)
    ) {
      collection_weight_kg_numeric = randomFloat(50, 300);
    } else {
      collection_weight_kg_numeric = randomFloat(500, 2000);
    }

    wasteFacts.push({
      waste_id: i,
      time_id: randomItem(timeDims).time_id,
      location_id: randomLocation.location_id,
      waste_type_id: randomWasteType.waste_type_id,
      collection_weight_kg_numeric,
    });
  }
  await prisma.fact_waste.createMany({ data: wasteFacts });
  console.log(`Created ${wasteFacts.length} waste facts.`);

  // --- Create fact_weather ---
  const weatherFacts = [];
  for (let i = 1; i <= NUM_FACTS_PER_TABLE; i++) {
    const time = randomItem(timeDims);
    const month = time.month_val ?? 1;

    let baseTemp: number;
    let baseAQI: number;
    let basePM25: number;

    if (month >= 3 && month <= 5) {
      // Hot
      baseTemp = 32;
      baseAQI = 60;
      basePM25 = 30;
    } else if (month >= 6 && month <= 10) {
      // Rainy
      baseTemp = 29;
      baseAQI = 30;
      basePM25 = 15;
    } else {
      // Cool/Dry
      baseTemp = 27;
      baseAQI = 80;
      basePM25 = 40;
    }

    weatherFacts.push({
      weather_id: i,
      time_id: time.time_id,
      location_id: randomItem(locationDims).location_id,
      avg_aqi_numeric: randomFloat(baseAQI - 10, baseAQI + 40),
      max_pm25_numeric: randomFloat(basePM25 - 5, basePM25 + 35),
      avg_temperature_numeric: randomFloat(baseTemp - 2, baseTemp + 4),
    });
  }
  await prisma.fact_weather.createMany({ data: weatherFacts });
  console.log(`Created ${weatherFacts.length} weather facts.`);

  console.log('Seeding completed successfully.');
}

// --- Run the Seeder ---

main()
  .catch((e) => {
    console.error('Seeding error', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

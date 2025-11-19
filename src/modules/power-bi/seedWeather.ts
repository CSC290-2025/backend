import prisma from '../../config/client';

// --- Configuration ---
const NUM_LOCATIONS = 20; // Number of distinct locations (districts)
const DAYS_TO_SEED = 365 * 2; // Generate data for the last 2 years
const RECORDS_PER_DAY = 24; // Hourly records

// --- Helper Functions ---

/**
 * Generates a random integer between min and max (inclusive).
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random float between min and max.
 */
function randomFloat(min: number, max: number, decimals: number = 2): number {
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
  'Sathorn',
  'Watthana',
  'Pathum Wan',
  'Ratchathewi',
  'Khlong Toei',
  'Bang Rak',
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

const weatherDescriptions = [
  'Clear',
  'Partly Cloudy',
  'Cloudy',
  'Light Rain',
  'Heavy Rain',
  'Thunderstorm',
  'Hazy',
];

const windDirections = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

// --- Main Seeding Function ---

async function main() {
  console.log('Starting to seed weather and air quality data...');

  // 1. Clean up existing data in the correct order
  console.log(
    'Cleaning up old weather, air quality, and related address data...'
  );
  await prisma.air_quality.deleteMany({});
  await prisma.weather_data.deleteMany({});
  // We will create specific addresses for this seed, so we can clean them up
  // Note: This assumes other data does not depend on these specific addresses.
  // A more robust approach might be to add a flag to the addresses table.
  await prisma.addresses.deleteMany({
    where: {
      province: 'Bangkok',
      subdistrict: 'WeatherSeed',
    },
  });

  // 2. Create Address locations for the weather data
  console.log(`Creating ${NUM_LOCATIONS} address records for locations...`);
  const addresses = [];
  for (let i = 0; i < NUM_LOCATIONS; i++) {
    const district = locationNames[i] || `District ${i + 1}`;
    const address = await prisma.addresses.create({
      data: {
        address_line: `Weather Station, ${district}`,
        province: 'Bangkok',
        district: district,
        subdistrict: 'WeatherSeed', // Flag for easy cleanup
        postal_code: `${10100 + i}`,
      },
    });
    addresses.push(address);
  }
  console.log(`Created ${addresses.length} address records.`);

  // 3. Generate and insert data in chunks
  console.log(
    `Preparing to generate ${DAYS_TO_SEED * RECORDS_PER_DAY * NUM_LOCATIONS} records for weather and air quality each...`
  );

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - DAYS_TO_SEED);

  const allWeatherRecords = [];
  const allAirQualityRecords = [];

  for (let day = 0; day < DAYS_TO_SEED; day++) {
    for (let hour = 0; hour < RECORDS_PER_DAY; hour++) {
      const recordDate = new Date(startDate);
      recordDate.setDate(recordDate.getDate() + day);
      recordDate.setHours(hour, 0, 0, 0);

      for (const address of addresses) {
        const month = recordDate.getMonth() + 1; // 1-12

        // --- Weather Data Logic ---
        let baseTemp: number;
        let baseHumidity: number;
        let baseRainProb: number;
        if (month >= 3 && month <= 5) {
          // Hot season
          baseTemp = 32;
          baseHumidity = 75;
          baseRainProb = 15;
        } else if (month >= 6 && month <= 10) {
          // Rainy season
          baseTemp = 29;
          baseHumidity = 85;
          baseRainProb = 60;
        } else {
          // Cool/Dry season
          baseTemp = 27;
          baseHumidity = 65;
          baseRainProb = 5;
        }

        const temperature = randomFloat(baseTemp - 3, baseTemp + 5);

        allWeatherRecords.push({
          location_id: address.id,
          temperature: temperature,
          feel_temperature: randomFloat(temperature - 2, temperature + 2),
          humidity: randomFloat(baseHumidity - 10, baseHumidity + 10),
          wind_speed: randomFloat(5, 25),
          wind_direction: randomItem(windDirections),
          rainfall_probability: randomFloat(
            baseRainProb - 5,
            baseRainProb + 30
          ),
          created_at: recordDate,
        });

        // --- Air Quality Data Logic ---
        let baseAQI: number;
        let basePM25: number;
        if (month >= 11 || month <= 2) {
          // "Pollution" season
          baseAQI = 90;
          basePM25 = 45;
        } else if (month >= 6 && month <= 10) {
          // Rainy season (cleaner air)
          baseAQI = 35;
          basePM25 = 12;
        } else {
          baseAQI = 60;
          basePM25 = 25;
        }

        const aqi = randomFloat(baseAQI - 15, baseAQI + 60);
        let category: 'good' | 'moderate' | 'unhealthy' | 'hazardous';
        if (aqi <= 50) category = 'good';
        else if (aqi <= 100) category = 'moderate';
        else if (aqi <= 150) category = 'unhealthy';
        else category = 'hazardous';

        allAirQualityRecords.push({
          location_id: address.id,
          aqi: aqi,
          pm25: randomFloat(basePM25 - 7, basePM25 + 40),
          category: category,
          measured_at: recordDate,
        });
      }
    }
    if (day % 30 === 0 && day > 0) {
      console.log(`Generated data for ${day} days...`);
    }
  }

  // 4. Insert data into the database using createMany
  console.log('Inserting weather data into the database...');
  await prisma.weather_data.createMany({
    data: allWeatherRecords,
    skipDuplicates: true,
  });
  console.log(`Inserted ${allWeatherRecords.length} weather data records.`);

  console.log('Inserting air quality data into the database...');
  await prisma.air_quality.createMany({
    data: allAirQualityRecords,
    skipDuplicates: true,
  });
  console.log(`Inserted ${allAirQualityRecords.length} air quality records.`);

  console.log('Weather and air quality data seeding completed successfully.');
}

// --- Run the Seeder ---

main()
  .catch((e) => {
    console.error('An error occurred during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

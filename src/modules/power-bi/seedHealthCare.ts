import { Prisma, PrismaClient } from '../../generated/prisma';
import prisma from '../../config/client';

// --- Configuration ---
const NUM_FACILITIES = 25;
const NUM_PATIENTS = 500;
const NUM_DOCTORS = 50;
const NUM_NURSES = 100;
const APPOINTMENTS_PER_PATIENT = 10;
const PRESCRIPTIONS_PER_PATIENT = 5;
const EMERGENCY_CALLS = 200;

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
const firstNames = [
  'John',
  'Jane',
  'Peter',
  'Mary',
  'David',
  'Susan',
  'Michael',
  'Linda',
  'James',
  'Patricia',
];
const lastNames = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
];
const facilityNames = [
  'General Hospital',
  'Community Clinic',
  'Medical Center',
  'Urgent Care',
  'Wellness Hub',
];
const departments = [
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Oncology',
  'Emergency',
  'Orthopedics',
  'Radiology',
];
const specialties = [
  'Cardiologist',
  'Neurologist',
  'Pediatrician',
  'Oncologist',
  'Orthopedic Surgeon',
];
const medications = [
  'Aspirin',
  'Ibuprofen',
  'Penicillin',
  'Amoxicillin',
  'Metformin',
  'Lisinopril',
  'Atorvastatin',
];
const appointmentTypes = [
  'Check-up',
  'Follow-up',
  'Consultation',
  'Procedure',
  'Vaccination',
];
const paymentMethods = ['Insurance', 'Credit Card', 'Cash'];
const genders = ['male', 'female', 'none'] as const;

async function main() {
  console.log('Starting to seed healthcare data...');

  // 1. Clean up existing data
  console.log('Cleaning up old healthcare data...');
  await prisma.payments.deleteMany({
    where: { service_type: { contains: 'Health' } },
  });
  await prisma.emergency_calls.deleteMany({});
  await prisma.prescriptions.deleteMany({});
  await prisma.appointments.deleteMany({});
  await prisma.beds.deleteMany({});
  await prisma.ambulances.deleteMany({});
  await prisma.patients.deleteMany({});
  await prisma.facilities.deleteMany({
    where: { name: { contains: 'HealthSeed' } },
  });

  // Clean up records that might have a non-nullable relation to users
  await prisma.users_specialty.deleteMany({
    where: { users: { email: { contains: '@healthseed.com' } } },
  });
  await prisma.users_departments.deleteMany({
    where: { users: { email: { contains: '@healthseed.com' } } },
  });
  await prisma.user_profiles.deleteMany({
    where: { users: { email: { contains: '@healthseed.com' } } },
  });
  await prisma.apartment_booking.deleteMany({
    where: { users: { email: { contains: '@healthseed.com' } } },
  });
  await prisma.apartment_owner.deleteMany({
    where: { users: { email: { contains: '@healthseed.com' } } },
  });
  await prisma.rating.deleteMany({
    where: { users: { email: { contains: '@healthseed.com' } } },
  });

  await prisma.users.deleteMany({
    where: { email: { contains: '@healthseed.com' } },
  });
  await prisma.addresses.deleteMany({ where: { subdistrict: 'HealthSeed' } });
  await prisma.departments.deleteMany({
    where: { department_name: { in: departments } },
  });
  await prisma.specialty.deleteMany({
    where: { specialty_name: { in: specialties } },
  });

  // 2. Create foundational data
  console.log(
    'Creating foundational data (addresses, departments, specialties)...'
  );
  const addressList = [];
  for (let i = 0; i < NUM_FACILITIES + NUM_PATIENTS; i++) {
    addressList.push(
      await prisma.addresses.create({
        data: {
          address_line: `${randomInt(1, 1000)} Main St`,
          province: 'Bangkok',
          district: `District ${randomInt(1, 20)}`,
          subdistrict: 'HealthSeed',
          postal_code: `${10100 + i}`,
        },
      })
    );
  }

  const departmentList = await Promise.all(
    departments.map((name) =>
      prisma.departments.create({ data: { department_name: name } })
    )
  );
  const specialtyList = await Promise.all(
    specialties.map((name) =>
      prisma.specialty.create({ data: { specialty_name: name } })
    )
  );

  // 3. Create Users (Patients, Doctors, Nurses)
  console.log('Creating users with admin/citizen roles...');
  const citizenRole = await prisma.roles.upsert({
    where: { role_name: 'citizen' },
    update: {},
    create: { role_name: 'citizen' },
  });
  const adminRole = await prisma.roles.upsert({
    where: { role_name: 'admin' },
    update: {},
    create: { role_name: 'admin' },
  });

  const patientUsers = [];
  for (let i = 0; i < NUM_PATIENTS; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    patientUsers.push(
      await prisma.users.create({
        data: {
          username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@healthseed.com`,
          password_hash: 'password123', // Use a hashed password in a real app
          role_id: citizenRole.id, // Patients are citizens
          user_profiles: {
            create: {
              first_name: firstName,
              last_name: lastName,
              address_id: randomItem(addressList).id,
              birth_date: randomDate(
                new Date(1950, 0, 1),
                new Date(2005, 11, 31)
              ),
              gender: randomItem(genders),
            },
          },
          patients: { create: {} },
        },
        include: { patients: true },
      })
    );
  }
  console.log(
    `Created ${patientUsers.length} patient users with the 'citizen' role.`
  );

  const staffUsers = [];
  for (let i = 0; i < NUM_DOCTORS + NUM_NURSES; i++) {
    const isDoctor = i < NUM_DOCTORS;
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    staffUsers.push(
      await prisma.users.create({
        data: {
          username: `staff_${firstName.toLowerCase()}${i}`,
          email: `staff.${firstName.toLowerCase()}${i}@healthseed.com`,
          password_hash: 'password123',
          role_id: citizenRole.id, // Staff are admins
          user_profiles: {
            create: { first_name: firstName, last_name: lastName },
          },
          users_specialty: isDoctor
            ? { create: { specialty_id: randomItem(specialtyList).id } }
            : undefined,
          users_departments: {
            create: { department_id: randomItem(departmentList).id },
          },
        },
      })
    );
  }
  console.log(
    `Created ${staffUsers.length} staff users (doctors/nurses) with the 'citizen' role.`
  );

  // 4. Create Facilities & Ambulances
  console.log('Creating facilities and ambulances...');
  const facilityList = [];
  for (let i = 0; i < NUM_FACILITIES; i++) {
    facilityList.push(
      await prisma.facilities.create({
        data: {
          name: `${randomItem(facilityNames)} Branch ${i + 1} (HealthSeed)`,
          facility_type: randomItem(['Hospital', 'Clinic']),
          address_id: randomItem(addressList).id,
          department_id: randomItem(departmentList).id,
          emergency_services: Math.random() > 0.5,
        },
      })
    );
  }

  const ambulanceList = [];
  for (let i = 0; i < NUM_FACILITIES; i++) {
    ambulanceList.push(
      await prisma.ambulances.create({
        data: {
          vehicle_number: `AMB-${100 + i}`,
          status: 'available',
          base_facility_id: randomItem(facilityList).id,
        },
      })
    );
  }

  // 5. Create Beds
  console.log('Creating beds...');
  const bedList = [];
  for (const facility of facilityList) {
    for (let i = 1; i <= 50; i++) {
      const isOccupied = Math.random() > 0.7;
      bedList.push(
        await prisma.beds.create({
          data: {
            facility_id: facility.id,
            bed_number: `B-${100 + i}`,
            bed_type: randomItem(['Standard', 'ICU', 'Pediatric']),
            status: isOccupied ? 'occupied' : 'available',
            patient_id: isOccupied
              ? randomItem(patientUsers).patients[0].id
              : undefined,
          },
        })
      );
    }
  }

  // 6. Create Appointments, Prescriptions, and Payments
  console.log('Creating appointments, prescriptions, and payments...');
  const appointments = [];
  const prescriptions = [];
  const payments = [];

  for (const patientUser of patientUsers) {
    for (let i = 0; i < APPOINTMENTS_PER_PATIENT; i++) {
      const appointmentDate = randomDate(new Date(2024, 0, 1), new Date());
      appointments.push({
        patient_id: patientUser.patients[0].id,
        facility_id: randomItem(facilityList).id,
        staff_user_id: randomItem(staffUsers).id,
        appointment_at: appointmentDate,
        type: randomItem(appointmentTypes),
        status: randomItem(['completed', 'scheduled', 'cancelled']),
      });

      // Create a payment for each completed appointment
      if (appointments[appointments.length - 1].status === 'completed') {
        const amount = randomFloat(500, 5000);
        const insurance = randomFloat(0, amount * 0.8);
        payments.push({
          patient_id: patientUser.patients[0].id,
          facility_id: appointments[appointments.length - 1].facility_id,
          service_type: 'Health Appointment',
          amount: amount,
          insurance_coverage: insurance,
          patient_copay: amount - insurance,
          payment_method: randomItem(paymentMethods),
          status: 'paid',
          payment_date: appointmentDate,
        });
      }
    }

    for (let i = 0; i < PRESCRIPTIONS_PER_PATIENT; i++) {
      prescriptions.push({
        patient_id: patientUser.patients[0].id,
        prescriber_user_id: randomItem(staffUsers).id,
        facility_id: randomItem(facilityList).id,
        medication_name: randomItem(medications),
        quantity: randomInt(1, 3),
        status: 'filled',
      });
    }
  }
  await prisma.appointments.createMany({ data: appointments });
  await prisma.prescriptions.createMany({ data: prescriptions });
  await prisma.payments.createMany({ data: payments });

  // 7. Create Emergency Calls
  console.log('Creating emergency calls...');
  const emergencyCalls = [];
  for (let i = 0; i < EMERGENCY_CALLS; i++) {
    emergencyCalls.push({
      patient_id: randomItem(patientUsers).patients[0].id,
      caller_phone: `08${randomInt(10000000, 99999999)}`,
      emergency_type: randomItem([
        'Cardiac Arrest',
        'Accident',
        'Stroke',
        'Breathing Difficulty',
      ]),
      severity: randomItem(['High', 'Medium', 'Low']),
      address_id: randomItem(addressList).id,
      ambulance_id: randomItem(ambulanceList).id,
      facility_id: randomItem(facilityList).id,
      status: 'resolved',
    });
  }
  await prisma.emergency_calls.createMany({ data: emergencyCalls });

  console.log('Healthcare data seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('An error occurred during healthcare seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

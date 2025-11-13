import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type {
  createAddressData,
  updateAddressData,
} from '../types/address.types';

export async function getAddressByID(id: number) {
  try {
    const address = await prisma.addresses.findUnique({
      where: { id },
    });
    return address;
  } catch (error) {
    throw handlePrismaError(error);
  }
}
export async function createAddress(data: createAddressData) {
  try {
    const address = await prisma.addresses.create({ data });
    return address;
  } catch (error) {
    throw handlePrismaError(error);
  }
}
export async function updateAddress(id: number, data: updateAddressData) {
  try {
    const room = await prisma.addresses.update({
      where: { id },
      data,
    });
    return room;
  } catch (error) {
    throw handlePrismaError(error);
  }
}

//cant delete address if being used in other tables
export async function deleteAddress(id: number) {
  try {
    const address = await prisma.addresses.findUnique({
      where: { id },
    });

    if (!address) {
      throw new Error('Address not found');
    }

    // Check all tables that might reference this address
    const [
      apartmentsUsingAddress,
      emergencyCallsUsingAddress,
      eventsUsingAddress,
      facilitiesUsingAddress,
      userProfilesUsingAddress,
      volunteerEventsUsingAddress,
    ] = await Promise.all([
      prisma.apartment.findMany({
        where: { address_id: id },
        select: { id: true, name: true },
      }),
      prisma.emergency_calls.findMany({
        where: { address_id: id },
        select: { id: true },
      }),
      prisma.events.findMany({
        where: { address_id: id },
        select: { id: true, title: true },
      }),
      prisma.facilities.findMany({
        where: { address_id: id },
        select: { id: true, name: true },
      }),
      prisma.user_profiles.findMany({
        where: { address_id: id },
        select: { user_id: true },
      }),
      prisma.volunteer_events.findMany({
        where: { address_id: id },
        select: { id: true, title: true },
      }),
    ]);

    // Build error message for dependencies
    const dependencies = [];

    if (apartmentsUsingAddress.length > 0) {
      const apartmentNames = apartmentsUsingAddress
        .map((apt) => apt.name || `Apartment ${apt.id}`)
        .join(', ');
      dependencies.push(
        `${apartmentsUsingAddress.length} apartment(s): ${apartmentNames}`
      );
    }

    if (emergencyCallsUsingAddress.length > 0) {
      dependencies.push(
        `${emergencyCallsUsingAddress.length} emergency call(s)`
      );
    }

    if (eventsUsingAddress.length > 0) {
      const eventNames = eventsUsingAddress
        .map((event) => event.title || `Event ${event.id}`)
        .join(', ');
      dependencies.push(`${eventsUsingAddress.length} event(s): ${eventNames}`);
    }

    if (facilitiesUsingAddress.length > 0) {
      const facilityNames = facilitiesUsingAddress
        .map((facility) => facility.name)
        .join(', ');
      dependencies.push(
        `${facilitiesUsingAddress.length} facilit(y/ies): ${facilityNames}`
      );
    }

    if (userProfilesUsingAddress.length > 0) {
      dependencies.push(`${userProfilesUsingAddress.length} user profile(s)`);
    }

    if (volunteerEventsUsingAddress.length > 0) {
      const eventNames = volunteerEventsUsingAddress
        .map((event) => event.title || `Volunteer Event ${event.id}`)
        .join(', ');
      dependencies.push(
        `${volunteerEventsUsingAddress.length} volunteer event(s): ${eventNames}`
      );
    }

    if (dependencies.length > 0) {
      throw new Error(
        `Cannot delete address as it is being used by: ${dependencies.join('; ')}. Please remove the address reference from these records first.`
      );
    }

    // If no dependencies exist, proceed with deletion
    await prisma.addresses.delete({
      where: { id },
    });
  } catch (error) {
    throw handlePrismaError(error);
  }
}

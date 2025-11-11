import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';

import type {
  User,
  UserProfile,
  Address,
  EmergencyContact,
  UpdateUserPersonalData,
  UpdateUserProfileData,
  UpdateUserHealthData,
  UpdateEmergencyContactData,
  UpdateAddressData,
  UpdateUserAccountData,
  CompleteUserData,
} from '../types/user.types';

const findUserById = async (user_id: number) => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: user_id,
      },
    });
    return user;
  } catch (error) {
    handlePrismaError(error);
  }
};

const findByUsername = async (username: string): Promise<User | null> => {
  try {
    const user = await prisma.users.findUnique({
      where: { username },
    });
    return user as unknown as User | null;
  } catch (error) {
    handlePrismaError(error);
    return null;
  }
};

const findByEmail = async (email: string): Promise<User | null> => {
  try {
    const user = await prisma.users.findUnique({
      where: { email },
    });
    return user as unknown as User | null;
  } catch (error) {
    handlePrismaError(error);
    return null;
  }
};

const updateUser = async (
  id: number,
  data: UpdateUserPersonalData
): Promise<User | null> => {
  try {
    const updated = await prisma.users.update({
      where: { id },
      data: {
        username: data.username,
        email: data.email,
        phone: data.phone,
        updated_at: new Date(),
      },
    });
    return updated as unknown as User;
  } catch (error) {
    handlePrismaError(error);
    return null;
  }
};

const updatePassword = async (
  id: number,
  hashedPassword: string
): Promise<User | null> => {
  try {
    const updated = await prisma.users.update({
      where: { id },
      data: {
        password_hash: hashedPassword,
        updated_at: new Date(),
      },
    });
    return updated as unknown as User;
  } catch (error) {
    handlePrismaError(error);
    return null;
  }
};

const updateUserProfile = async (
  userId: number,
  data: UpdateUserProfileData
): Promise<UserProfile | null> => {
  try {
    const profile = await prisma.user_profiles.upsert({
      where: { user_id: userId },
      update: {
        first_name: data.first_name,
        middle_name: data.middle_name,
        last_name: data.last_name,
      },
      create: {
        user_id: userId,
        first_name: data.first_name,
        middle_name: data.middle_name,
        last_name: data.last_name,
      },
    });
    return profile as unknown as UserProfile;
  } catch (error) {
    handlePrismaError(error);
    return null;
  }
};

const updateUserHealth = async (
  userId: number,
  data: UpdateUserHealthData
): Promise<UserProfile | null> => {
  try {
    const profile = await prisma.user_profiles.upsert({
      where: { user_id: userId },
      update: {
        birth_date: data.birth_date,
        gender: data.gender as any,
      },
      create: {
        user_id: userId,
        birth_date: data.birth_date,
        gender: data.gender as any,
      },
    });
    return profile as unknown as UserProfile;
  } catch (error) {
    handlePrismaError(error);
    return null;
  }
};

const updateAddress = async (
  userId: number,
  data: UpdateAddressData
): Promise<UserProfile | null> => {
  try {
    const profile = await prisma.user_profiles.findUnique({
      where: { user_id: userId },
    });

    let addressId = profile?.address_id;

    if (addressId) {
      await prisma.addresses.update({
        where: { id: addressId },
        data: {
          address_line: data.address_line,
          province: data.province,
          district: data.district,
          subdistrict: data.subdistrict,
          postal_code: data.postal_code,
          updated_at: new Date(),
        },
      });
    } else {
      const newAddress = await prisma.addresses.create({
        data: {
          address_line: data.address_line,
          province: data.province,
          district: data.district,
          subdistrict: data.subdistrict,
          postal_code: data.postal_code,
        },
      });
      addressId = newAddress.id;
    }

    const result = await prisma.user_profiles.upsert({
      where: { user_id: userId },
      update: {
        address_id: addressId,
        more_address_detail: data.more_address_detail,
      },
      create: {
        user_id: userId,
        address_id: addressId,
        more_address_detail: data.more_address_detail,
      },
    });

    return result as unknown as UserProfile;
  } catch (error) {
    handlePrismaError(error);
    return null;
  }
};

const createEmergencyContact = async (
  userId: number,
  data: UpdateEmergencyContactData
): Promise<EmergencyContact | null> => {
  try {
    const contact = await prisma.emergency_contacts.create({
      data: {
        user_id: userId,
        contact_name: data.contact_name,
        phone: data.phone,
      },
    });
    return contact as unknown as EmergencyContact;
  } catch (error) {
    handlePrismaError(error);
    return null;
  }
};

const updateEmergencyContact = async (
  id: number,
  data: UpdateEmergencyContactData
): Promise<EmergencyContact | null> => {
  try {
    const contact = await prisma.emergency_contacts.update({
      where: { id },
      data: {
        contact_name: data.contact_name,
        phone: data.phone,
      },
    });
    return contact as unknown as EmergencyContact;
  } catch (error) {
    handlePrismaError(error);
    return null;
  }
};

const deleteEmergencyContact = async (
  id: number
): Promise<EmergencyContact | null> => {
  try {
    const contact = await prisma.emergency_contacts.delete({
      where: { id },
    });
    return contact as unknown as EmergencyContact;
  } catch (error) {
    handlePrismaError(error);
    return null;
  }
};

const getEmergencyContacts = async (
  userId: number
): Promise<EmergencyContact[]> => {
  try {
    const contacts = await prisma.emergency_contacts.findMany({
      where: { user_id: userId },
    });
    return contacts as unknown as EmergencyContact[];
  } catch (error) {
    handlePrismaError(error);
    return [];
  }
};

export {
  findUserById,
  findByUsername,
  findByEmail,
  updateUser,
  updatePassword,
  updateUserProfile,
  updateUserHealth,
  updateAddress,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  getEmergencyContacts,
};

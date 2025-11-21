import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';

import type {
  User,
  UserProfile,
  Address,
  EmergencyContact,
  UpdateUserPersonalData,
  // UpdateUserProfileData,
  UpdateUserHealthData,
  UpdateEmergencyContactData,
  UpdateAddressData,
  UpdateUserAccountData,
  CompleteUserData,
  UpdateUserPersonal,
  UpdateUserHealth,
  UpdateUserAccount,
  Role,
  CreateUserRoleData,
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
  }
};

const findUserByIdForUserSettingPage = async (user_id: number) => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: user_id,
      },
      select: {
        username: true,
        email: true,
        phone: true,
        roles: {
          select: {
            role_name: true,
          },
        },
        insurance_cards: {
          select: {
            card_number: true,
          },
        },
        user_profiles: {
          select: {
            id_card_number: true,
            first_name: true,
            middle_name: true,
            last_name: true,
            birth_date: true,
            blood_type: true,
            congenital_disease: true,
            allergy: true,
            height: true,
            weight: true,
            gender: true,
            ethnicity: true,
            nationality: true,
            religion: true,
            profile_picture: true,
            addresses: {
              select: {
                address_line: true,
                province: true,
                district: true,
                subdistrict: true,
                postal_code: true,
              },
            },
          },
        },
        emergency_contacts: {
          select: {
            phone: true,
          },
        },
      },
    });
    return user;
  } catch (error) {
    handlePrismaError(error);
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
  }
};

// const updateUserProfile = async (
//   userId: number,
//   data: UpdateUserProfileData
// ): Promise<UserProfile | null> => {
//   try {
//     const profile = await prisma.user_profiles.upsert({
//       where: { user_id: userId },
//       update: {
//         first_name: data.first_name,
//         middle_name: data.middle_name,
//         last_name: data.last_name,
//       },
//       create: {
//         user_id: userId,
//         first_name: data.first_name,
//         middle_name: data.middle_name,
//         last_name: data.last_name,
//       },
//     });
//     return profile as unknown as UserProfile;
//   } catch (error) {
//     handlePrismaError(error);
//   }
// };

const updateUserPersonalData = async (
  user_id: number,
  data: UpdateUserPersonal
) => {
  try {
    const user = await prisma.users.update({
      where: { id: user_id },
      data: {
        phone: data.phone,
        user_profiles: {
          update: {
            where: { user_id },
            data: {
              id_card_number: data.id_card_number,
              first_name: data.first_name,
              middle_name: data.middle_name,
              last_name: data.last_name,
              ethnicity: data.ethnicity,
              nationality: data.nationality,
              religion: data.religion,
              address_id: data.address_id,
            },
          },
        },
      },
    });
    return user;
  } catch (error) {
    handlePrismaError(error);
  }
};

const updateUserHealthData = async (
  user_id: number,
  data: UpdateUserHealth
) => {
  try {
    const user = await prisma.user_profiles.upsert({
      where: { user_id },
      update: {
        birth_date: data.birth_date,
        blood_type: data.blood_type,
        congenital_disease: data.congenital_disease,
        allergy: data.allergy,
        height: data.height,
        weight: data.weight,
        gender: data.gender,
      },
      create: {
        user_id,
        birth_date: data.birth_date,
        blood_type: data.blood_type,
        congenital_disease: data.congenital_disease,
        allergy: data.allergy,
        height: data.height,
        weight: data.weight,
        gender: data.gender,
      },
    });
    return user;
  } catch (error) {
    handlePrismaError(error);
  }
};

const updateUserAccountData = async (
  user_id: number,
  data: UpdateUserAccount
) => {
  try {
    const user = await prisma.users.update({
      where: { id: user_id },
      data: {
        email: data.email,
        username: data.username,
        user_profiles: {
          update: {
            where: { user_id },
            data: {
              profile_picture: data.profile_picture,
            },
          },
        },
      },
    });
    return user;
  } catch (error) {
    handlePrismaError(error);
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
        birth_date: data.birth_date ? new Date(data.birth_date) : null,
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
  }
};

const findUsersByRole = async (roleName: string): Promise<User[]> => {
  try {
    const users = await prisma.users.findMany({
      where: {
        roles: {
          role_name: roleName,
        },
      },
      include: {
        roles: true,
      },
    });
    return users as unknown as User[];
  } catch (error) {
    handlePrismaError(error);
  }
};

//new code
const getUserRoles = async (user_id: number) => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: user_id,
      },
      select: {
        id: true,
        roles: {
          select: {
            id: true,
            role_name: true,
          },
        },
      },
    });
    return user;
  } catch (error) {
    handlePrismaError(error);
  }
};

const createUserRole = async (data: CreateUserRoleData) => {
  try {
    const userRole = await prisma.users.update({
      where: {
        id: data.user_id,
      },
      data: {
        role_id: data.role_id,
      },
      select: {
        id: true,
        role_id: true,
      },
    });
    return userRole;
  } catch (error) {
    handlePrismaError(error);
  }
};

export {
  findUserById,
  findByUsername,
  findByEmail,
  updateUser,
  updatePassword,
  updateUserHealth,
  updateAddress,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  getEmergencyContacts,
  findUsersByRole,
  findUserByIdForUserSettingPage,
  updateUserPersonalData,
  updateUserHealthData,
  updateUserAccountData,
  getUserRoles,
  createUserRole,
};

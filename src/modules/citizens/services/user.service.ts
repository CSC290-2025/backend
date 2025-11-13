import { UserModel } from '../models';
import crypto from 'crypto';

import type {
  User,
  UserProfile,
  UpdateUserPersonalData,
  UpdateUserProfileData,
  UpdateUserHealthData,
  UpdateEmergencyContactData,
  UpdateAddressData,
  UpdateUserAccountData,
  UpdatePasswordData,
  EmergencyContact,
} from '../types/user.types';
import {
  NotFoundError,
  ValidationError,
  ConflictError,
  UnauthorizedError,
} from '@/errors';

const getUserById = async (id: number) => {
  const user = await UserModel.findUserById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
};

const getUserProflie = async (user_id: number) => {
  const user = await UserModel.findUserByIdForUserSettingPage(user_id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
};

const updatePersonalInfo = async (id: number, data: UpdateUserPersonalData) => {
  await getUserById(id);

  if (data.username) {
    const existingUser = await UserModel.findByUsername(data.username);
    if (existingUser && existingUser.id !== id) {
      throw new ConflictError('Username already taken');
    }

    if (data.username.length < 3) {
      throw new ValidationError('Username must be at least 3 characters');
    }
  }

  if (data.email) {
    const existingUser = await UserModel.findByEmail(data.email);
    if (existingUser && existingUser.id !== id) {
      throw new ConflictError('Email already in use');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new ValidationError('Invalid email format');
    }
  }

  if (data.phone && !/^\d{10}$/.test(data.phone)) {
    throw new ValidationError('Phone number must be 10 digits');
  }

  return await UserModel.updateUser(id, data);
};

const updateUserProfile = async (
  id: number,
  data: UpdateUserProfileData
): Promise<UserProfile | null> => {
  await getUserById(id);

  if (data.first_name && data.first_name.trim().length < 2) {
    throw new ValidationError('First name must be at least 2 characters');
  }

  if (data.last_name && data.last_name.trim().length < 2) {
    throw new ValidationError('Last name must be at least 2 characters');
  }

  return await UserModel.updateUserProfile(id, data);
};

const updateHealthInfo = async (id: number, data: UpdateUserHealthData) => {
  await getUserById(id);

  if (data.birth_date) {
    const birthDate = new Date(data.birth_date);
    if (birthDate > new Date()) {
      throw new ValidationError('Birth date cannot be in the future');
    }
  }

  if (data.gender && !['male', 'female', 'none'].includes(data.gender)) {
    throw new ValidationError('Invalid gender value');
  }

  return await UserModel.updateUserHealth(id, data);
};

const updateAddress = async (
  id: number,
  data: UpdateAddressData
): Promise<UserProfile> => {
  await getUserById(id);

  if (data.postal_code && !/^\d{5}$/.test(data.postal_code)) {
    throw new ValidationError('Postal code must be 5 digits');
  }

  const j = await UserModel.updateAddress(id, data);
  if (!j) {
    throw new NotFoundError();
  }
  return j;
};

const createEmergencyContact = async (
  userId: number,
  data: UpdateEmergencyContactData
): Promise<EmergencyContact | null> => {
  await getUserById(userId);

  if (!data.contact_name || data.contact_name.trim().length < 2) {
    throw new ValidationError('Contact name must be at least 2 characters');
  }

  if (data.phone && !/^\d{10}$/.test(data.phone)) {
    throw new ValidationError('Phone number must be 10 digits');
  }

  return await UserModel.createEmergencyContact(userId, data);
};

const updateEmergencyContact = async (
  id: number,
  data: UpdateEmergencyContactData
): Promise<EmergencyContact | null> => {
  if (!data.contact_name || data.contact_name.trim().length < 2) {
    throw new ValidationError('Contact name must be at least 2 characters');
  }

  if (data.phone && !/^\d{10}$/.test(data.phone)) {
    throw new ValidationError('Phone number must be 10 digits');
  }

  return await UserModel.updateEmergencyContact(id, data);
};

const deleteEmergencyContact = async (
  id: number
): Promise<EmergencyContact | null> => {
  return await UserModel.deleteEmergencyContact(id);
};

const getEmergencyContacts = async (
  userId: number
): Promise<EmergencyContact[]> => {
  await getUserById(userId);
  return await UserModel.getEmergencyContacts(userId);
};

const updateAccountInfo = async (
  id: number,
  data: UpdateUserAccountData
): Promise<User | null> => {
  const user = await getUserById(id);

  if (data.username && data.username !== user.username) {
    const existingUser = await UserModel.findByUsername(data.username);
    if (existingUser) {
      throw new ConflictError('Username already taken');
    }

    if (data.username.length < 3) {
      throw new ValidationError('Username must be at least 3 characters');
    }
  }

  if (data.email && data.email !== user.email) {
    const existingUser = await UserModel.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('Email already in use');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new ValidationError('Invalid email format');
    }
  }

  return await UserModel.updateUser(id, data);
};

// const hashPassword = (password: string): string => {
//   return crypto.createHash('sha256').update(password).digest('hex');
// };

// const updatePassword = async (
//   id: number,
//   data: UpdatePasswordData
// ): Promise<User | null> => {
//   const user = await getUserById(id);

//   // Verify current password
//   if (!data.currentPassword) {
//     throw new ValidationError('Current password is required');
//   }

//   const currentHashed = hashPassword(data.currentPassword);
//   const isPasswordValid = currentHashed === user.password_hash;

//   if (!isPasswordValid) {
//     throw new UnauthorizedError('Current password is incorrect');
//   }

//   // Validate new password
//   if (!data.newPassword) {
//     throw new ValidationError('New password is required');
//   }

//   if (data.newPassword.length < 8) {
//     throw new ValidationError('New password must be at least 8 characters');
//   }

//   // Check if passwords match
//   if (data.newPassword !== data.confirmNewPassword) {
//     throw new ValidationError('New passwords do not match');
//   }

//   // “Hash” new password (SHA-256 for demo; not secure for production)
//   const hashedPassword = hashPassword(data.newPassword);

//   return await UserModel.updatePassword(id, hashedPassword);
// };

const getUsersByRole = async (
  roleName: string
): Promise<Omit<User, 'password_hash'>[]> => {
  const users = await UserModel.findUsersByRole(roleName);

  if (!users || users.length === 0) {
    throw new NotFoundError(`No users found with role: ${roleName}`);
  }

  return users.map((u: User) => {
    const { password_hash, ...safe } = u;
    return safe;
  });
};

export {
  getUserById,
  updatePersonalInfo,
  updateUserProfile,
  updateHealthInfo,
  updateAddress,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  getEmergencyContacts,
  updateAccountInfo,
  // updatePassword,
  getUsersByRole,
  getUserProflie,
};

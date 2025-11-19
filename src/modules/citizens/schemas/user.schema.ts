import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const UserinfoAndWalletSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.email(),
  phone: z.string().nullable(),
});

const InsuranceCardSchema = z.object({
  card_number: z.string(),
});

const EmergencyContactSchema = z.object({
  phone: z.string().nullable(),
});

const AddressSchema = z.object({
  address_line: z.string().nullable(),
  province: z.string().nullable(),
  district: z.string().nullable(),
  subdistrict: z.string().nullable(),
  postal_code: z.string().nullable(),
});

const UserProfileSchema = z.object({
  id_card_number: z.string().nullable(),
  first_name: z.string().nullable(),
  middle_name: z.string().nullable(),
  last_name: z.string().nullable(),
  birth_date: z.date().nullable(),
  blood_type: z.string().nullable(),
  congenital_disease: z.string().nullable(),
  allergy: z.string().nullable(),
  height: z.number().nullable(),
  weight: z.number().nullable(),
  gender: z.string().nullable(),
  profile: z.string().nullable(),
  addresses: z.array(AddressSchema),
});

const UserSettingPageSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  insurance_cards: z.array(InsuranceCardSchema),
  user_profiles: z.array(UserProfileSchema),
  emergency_contacts: z.array(EmergencyContactSchema),
});

const UserPersonalData = z.object({
  user: z.object({
    phone: z.string(),
    user_profile: z.object({
      id_card_number: z.string().nullable(),
      first_name: z.string().nullable(),
      middle_name: z.string().nullable(),
      last_name: z.string().nullable(),
      ethnicity: z.string().nullable(),
      nationality: z.string().nullable(),
      religion: z.string().nullable(),
    }),
    address: z.union([AddressSchema, z.array(AddressSchema)]),
  }),
});

const UserHealthData = z.object({
  birth_date: z.coerce.date().nullable(),
  blood_type: z.string().nullable(),
  congenital_disease: z.string().nullable(),
  allergy: z.string().nullable(),
  height: z.number().nullable(),
  weight: z.number().nullable(),
  gender: z.string().nullable(),
});

const UserAccountData = z.object({
  username: z.string().nullable(),
  email: z.email().nullable(),
  profile_picture: z.string().nullable(),
});

const UserIdParam = z.object({
  id: z.coerce.number(),
});

const getUserinfoAndWallet = createGetRoute({
  path: '/user/wallet/{id}',
  summary: 'Get user data and user wallet by user ID',
  responseSchema: UserinfoAndWalletSchema,
  params: UserIdParam,
  tags: ['User'],
});

const getUserProflie = createGetRoute({
  path: '/user/profile/{id}',
  summary: 'Get user data to show at user setting page',
  responseSchema: UserSettingPageSchema,
  params: UserIdParam,
  tags: ['User'],
});

// const updateUserProfile = createPutRoute({
//   path: '/user/profile/{id}',
//   summary: 'Update user profile',
//   requestSchema: UserSettingPageSchema,
//   responseSchema: UserSettingPageSchema,
//   params: UserIdParam,
//   tags: ['User']
// })

const updateUserPersonal = createPutRoute({
  path: '/user/profile/personal/{id}',
  summary: 'Update user personal data from frontend',
  requestSchema: UserPersonalData,
  responseSchema: UserSettingPageSchema,
  params: UserIdParam,
  tags: ['User'],
});

const updateUserHealth = createPutRoute({
  path: '/user/profile/health/{id}',
  summary: 'Update user health data from frontend',
  requestSchema: UserHealthData,
  responseSchema: UserSettingPageSchema,
  params: UserIdParam,
  tags: ['User'],
});

const updateUserAccount = createPutRoute({
  path: '/user/profile/account/{id}',
  summary: 'Update user account data from frontend',
  requestSchema: UserAccountData,
  responseSchema: UserSettingPageSchema,
  params: UserIdParam,
  tags: ['User'],
});

export const UserSchemas = {
  getUserinfoAndWallet,
  getUserProflie,
  updateUserPersonal,
  updateUserHealth,
  updateUserAccount,
};

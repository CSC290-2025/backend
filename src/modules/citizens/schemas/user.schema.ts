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
  addresses: z.array(AddressSchema),
});

const InsuranceCardSchema = z.object({
  card_number: z.string(),
});

const EmergencyContactSchema = z.object({
  phone: z.string().nullable(),
});

const UserSettingPageSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  insurance_cards: z.array(InsuranceCardSchema),
  user_profiles: z.array(UserProfileSchema),
  emergency_contacts: z.array(EmergencyContactSchema),
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
  path: 'user/profile/{id}',
  summary: 'Get user data to show at user setting page',
  responseSchema: UserSettingPageSchema,
  params: UserIdParam,
  tags: ['User'],
});

export const UserSchemas = {
  getUserinfoAndWallet,
  getUserProflie,
};

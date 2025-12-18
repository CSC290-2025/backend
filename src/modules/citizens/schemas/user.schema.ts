import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';
import { authMiddleware, adminMiddleware } from '@/middlewares';
import { id } from 'zod/v4/locales';

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
  id: z.number(),
  address_line: z.string().nullable(),
  province: z.string().nullable(),
  district: z.string().nullable(),
  subdistrict: z.string().nullable(),
  postal_code: z.string().nullable(),
});

const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
  confirmNewPassword: z.string().min(6),
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
  specialty_id: z.number().nullable(),
  profile: z.string().nullable(),
  addresses: z.array(AddressSchema),
});

const UserSettingPageSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  role_id: z.number().nullable(),
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
  blood_type: z.enum(['A', 'B', 'AB', 'O']).nullable(),
  congenital_disease: z.string().nullable(),
  allergy: z.string().nullable(),
  height: z.number().nullable(),
  weight: z.number().nullable(),
  gender: z.enum(['male', 'female', 'none']).nullable(),
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
  // middleware: [authMiddleware, adminMiddleware],
});

const getUserAddress = createGetRoute({
  path: '/user/address/{id}',
  summary: 'Get user address data',
  responseSchema: AddressSchema,
  params: UserIdParam,
  tags: ['User'],
});

const updatePassword = createPutRoute({
  path: '/user/password/{id}',
  summary: 'Update user password',
  requestSchema: UpdatePasswordSchema,
  responseSchema: z.object({}),
  params: UserIdParam,
  tags: ['User'],
});

const getUserProflie = createGetRoute({
  path: '/user/profile/{id}',
  summary: 'Get user data to show at user setting page',
  responseSchema: UserSettingPageSchema,
  params: UserIdParam,
  tags: ['User'],
  // middleware: [authMiddleware, adminMiddleware],
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
  summary: 'Update user personal data (admin only)',
  requestSchema: UserPersonalData,
  responseSchema: UserSettingPageSchema,
  params: UserIdParam,
  tags: ['User'],
  // middleware: [authMiddleware, adminMiddleware],
});

const updateUserHealth = createPutRoute({
  path: '/user/profile/health/{id}',
  summary: 'Update user health data (admin only)',
  requestSchema: UserHealthData,
  responseSchema: UserSettingPageSchema,
  params: UserIdParam,
  tags: ['User'],
  middleware: [authMiddleware],
});

const updateUserAccount = createPutRoute({
  path: '/user/profile/account/{id}',
  summary: 'Update user account data (admin only)',
  requestSchema: UserAccountData,
  responseSchema: UserSettingPageSchema,
  params: UserIdParam,
  tags: ['User'],
  // middleware: [authMiddleware, adminMiddleware],
});

const getCurrentUserProfile = createGetRoute({
  path: '/user/me',
  summary: 'Get current user profile (authenticated)',
  responseSchema: UserSettingPageSchema,
  tags: ['User'],
  middleware: [authMiddleware],
});

const updateCurrentUserPersonal = createPutRoute({
  path: '/user/me/personal',
  summary: 'Update current user personal data',
  requestSchema: UserPersonalData,
  responseSchema: UserSettingPageSchema,
  tags: ['User'],
  // middleware: [authMiddleware],
});

const updateCurrentUserHealth = createPutRoute({
  path: '/user/me/health',
  summary: 'Update current user health data',
  requestSchema: UserHealthData,
  responseSchema: UserSettingPageSchema,
  tags: ['User'],
  middleware: [authMiddleware],
});

const updateCurrentUserAccount = createPutRoute({
  path: '/user/me/account',
  summary: 'Update current user account data',
  requestSchema: UserAccountData,
  responseSchema: UserSettingPageSchema,
  tags: ['User'],
  // middleware: [authMiddleware],
});

const RoleSchema = z.object({
  id: z.number(),
  role_name: z.string(),
});

const UserRolesResponseSchema = z.object({
  userId: z.number(),
  roles: z.array(RoleSchema),
});

const CreateUserRoleSchema = z.object({
  user_id: z.number(),
  role_id: z.number(),
});

const UserRoleResponseSchema = z.object({
  user_id: z.number(),
  role_id: z.number().nullable(),
});

const getUserRoles = createGetRoute({
  path: '/user/roles/{id}',
  summary: 'Get roles by user ID',
  responseSchema: UserRolesResponseSchema,
  params: UserIdParam,
  tags: ['User'],
});

const createUserRole = createPostRoute({
  path: '/user/roles',
  summary: 'Create new user role',
  requestSchema: CreateUserRoleSchema,
  responseSchema: UserRoleResponseSchema,
  tags: ['User'],
});

const ProfilePictureResponse = z.object({
  userId: z.number(),
  profilePictureUrl: z.string().nullable(),
});

const updateProfilePictureBase = createPutRoute({
  path: '/user/profile/picture/{id}',
  summary: 'Update user profile picture',
  params: UserIdParam,
  tags: ['User'],
  requestSchema: z.object({}),
  responseSchema: ProfilePictureResponse,
});

const updateProfilePicture = {
  ...updateProfilePictureBase,
  request: {
    ...updateProfilePictureBase.request,
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            file: z.instanceof(File).openapi({
              type: 'string',
              format: 'binary',
              description: 'The image file to upload',
            }),
          }),
        },
      },
    },
  },
};

export const UserSchemas = {
  getUserinfoAndWallet,
  getUserProflie,
  updateUserPersonal,
  updateUserHealth,
  updateUserAccount,
  getUserAddress,
  getUserRoles,
  createUserRole,
  getCurrentUserProfile,
  updateCurrentUserPersonal,
  updateCurrentUserHealth,
  updateCurrentUserAccount,
  updateProfilePicture,
  updatePassword,
};

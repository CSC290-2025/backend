import type { Context } from 'hono';
import { UserService } from '../services/index';
import { successResponse } from '@/utils/response';
import { ValidationError } from '@/errors';

const getUser = async (c: Context) => {
  const id = parseInt(c.req.param('id'));
  const user = await UserService.getUserById(id);

  const { password_hash, ...safeUser } = user;

  return successResponse(c, { user: safeUser });
};

const getUserProflie = async (c: Context) => {
  const user_id = parseInt(c.req.param('id'));
  const user = await UserService.getUserProflie(user_id);
  return successResponse(c, { user }, 200, 'User fetch successfully');
};

const updatePersonalInfo = async (c: Context) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();

  const user = await UserService.updatePersonalInfo(id, body);

  return successResponse(
    c,
    { user: user },
    200,
    'Personal information updated successfully'
  );
};

// const updateUserProfile = async (c: Context) => {
//   const id = parseInt(c.req.param('id'));
//   const body = await c.req.json();

//   const profile = await UserService.updateUserProfile(id, body);
//   return successResponse(
//     c,
//     { profile },
//     200,
//     'User profile updated successfully'
//   );
// };

const updateUserPersonalData = async (c: Context) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  let addressData = body.address;
  if (Array.isArray(addressData)) {
    addressData = addressData[0];
  }

  const updateUser = await UserService.updateUserPersonalData(
    id,
    body.user,
    addressData
  );
  return successResponse(c, { updateUser }, 200, 'User update successfully');
};

const updateUserHealthData = async (c: Context) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const updateUser = await UserService.updateUserHealthData(id, body);
  return successResponse(c, { updateUser }, 200, 'User update successfully');
};

const updateUserAccountData = async (c: Context) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const updateUser = await UserService.updateUserAccountData(id, body);
  return successResponse(c, { updateUser }, 200, 'User update successfully');
};

const updateHealthInfo = async (c: Context) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();

  const profile = await UserService.updateHealthInfo(id, body);
  return successResponse(
    c,
    { profile },
    200,
    'Health information updated successfully'
  );
};

const updateAddress = async (c: Context) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();

  const profile = await UserService.updateAddress(id, body);
  return successResponse(c, { profile }, 200, 'Address updated successfully');
};

const getEmergencyContacts = async (c: Context) => {
  const userId = parseInt(c.req.param('id'));
  const contacts = await UserService.getEmergencyContacts(userId);
  return successResponse(c, { emergencyContacts: contacts });
};

const createEmergencyContact = async (c: Context) => {
  const userId = parseInt(c.req.param('id'));
  const body = await c.req.json();

  const contact = await UserService.createEmergencyContact(userId, body);
  return successResponse(
    c,
    { emergencyContact: contact },
    201,
    'Emergency contact created successfully'
  );
};

const updateEmergencyContact = async (c: Context) => {
  const contactId = parseInt(c.req.param('contactId'));
  const body = await c.req.json();

  const contact = await UserService.updateEmergencyContact(contactId, body);
  return successResponse(
    c,
    { emergencyContact: contact },
    200,
    'Emergency contact updated successfully'
  );
};

const deleteEmergencyContact = async (c: Context) => {
  const contactId = parseInt(c.req.param('contactId'));

  await UserService.deleteEmergencyContact(contactId);
  return successResponse(
    c,
    null,
    200,
    'Emergency contact deleted successfully'
  );
};

const updateAccountInfo = async (c: Context) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();

  const user = await UserService.updateAccountInfo(id, body);

  return successResponse(
    c,
    { user: user },
    200,
    'Account information updated successfully'
  );
};

// const updatePassword = async (c: Context) => {
//   const id = parseInt(c.req.param('id'));
//   const body = await c.req.json();

//   await UserService.updatePassword(id, body);

//   return successResponse(c, null, 200, 'Password updated successfully');
// };

const getUsersByRole = async (c: Context) => {
  const role = c.req.query('role');
  if (!role) throw new ValidationError("Query parameter 'role' is required");

  const users = await UserService.getUsersByRole(role);
  return successResponse(
    c,
    { users },
    200,
    `Users with role '${role}' retrieved successfully`
  );
};

const getCurrentUserProfile = async (c: Context) => {
  const user = c.get('user');
  const userProfile = await UserService.getUserProflie(user.userId);
  return successResponse(
    c,
    { user: userProfile },
    200,
    'User profile fetched successfully'
  );
};

const updateCurrentUserPersonal = async (c: Context) => {
  const user = c.get('user');
  const body = await c.req.json();
  const updatedUser = await UserService.updateUserPersonalData(
    user.userId,
    body.user,
    body.address
  );
  return successResponse(
    c,
    { updateUser: updatedUser },
    200,
    'Personal data updated successfully'
  );
};

const updateCurrentUserHealth = async (c: Context) => {
  const user = c.get('user');
  const body = await c.req.json();
  console.log(user);
  const updatedUser = await UserService.updateUserHealthData(user.userId, body);
  return successResponse(
    c,
    { updateUser: updatedUser },
    200,
    'Health data updated successfully'
  );
};

const updateCurrentUserAccount = async (c: Context) => {
  const user = c.get('user');
  const body = await c.req.json();
  const updatedUser = await UserService.updateUserAccountData(
    user.userId,
    body
  );
  return successResponse(
    c,
    { updateUser: updatedUser },
    200,
    'Account data updated successfully'
  );
};

export {
  getUser,
  updatePersonalInfo,
  updateHealthInfo,
  updateAddress,
  getEmergencyContacts,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  updateAccountInfo,
  // updatePassword,
  getUsersByRole,
  getUserProflie,
  updateUserPersonalData,
  updateUserHealthData,
  updateUserAccountData,
  getCurrentUserProfile,
  updateCurrentUserPersonal,
  updateCurrentUserHealth,
  updateCurrentUserAccount,
};

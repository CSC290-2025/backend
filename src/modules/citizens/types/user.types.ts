export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  password_hash: string;
  role_id?: number;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

export interface UserProfile {
  user_id: number;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  birth_date?: Date;
  gender?: 'male' | 'female' | 'none';
  address_id?: number;
  more_address_detail?: string;
}

export interface Address {
  id: number;
  address_line?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
  postal_code?: string;
}

export interface EmergencyContact {
  id: number;
  user_id?: number;
  contact_name: string;
  phone?: string;
}

export interface UpdateUserPersonalData {
  username?: string;
  email?: string;
  phone?: string;
}
export interface UpdateUserProfileData {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
}

export interface UpdateUserHealthData {
  birth_date?: Date;
  gender?: 'male' | 'female' | 'none';
}
export interface UpdateEmergencyContactData {
  contact_name: string;
  phone?: string;
}

export interface UpdateAddressData {
  address_line?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
  postal_code?: string;
  more_address_detail?: string;
}

export interface UpdateUserAccountData {
  username?: string;
  email?: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface CompleteUserData {
  user: User;
  profile?: UserProfile;
  address?: Address;
  emergencyContacts?: EmergencyContact[];
}

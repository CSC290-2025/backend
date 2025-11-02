export interface Address {
  id: number;
  address_line: string | null;
  province: string | null;
  district: string | null;
  subdistrict: string | null;
  postal_code: string | null;
}

export interface UserWithAddress {
  id: number;
  username: string;
  email: string;
  address: Address | null;
}

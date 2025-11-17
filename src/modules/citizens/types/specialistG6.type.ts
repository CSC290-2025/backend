export interface Specialist {
  id: number;
  specialty_name: string;
}

export interface UserSpecialistResponse {
  userId: number;
  specialists: Specialist[];
}

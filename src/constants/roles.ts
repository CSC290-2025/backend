/**
 * Centralized role name constants
 * Map role names for consistent access control
 *
 * System-wide roles that span across modules
 * Teams can extend with their own roles in their module constants
 */

export const ROLES = {
  // System Administrator - Full access to everything
  ADMIN: 'Admin',

  // Content Moderators
  MODERATOR: 'Moderator',

  TRAFFIC_MANAGER: 'Traffic Manager',
  EMERGENCY_MANAGER: 'Emergency Manager',
  HEALTH_MANAGER: 'Health Manager',
  KNOW_AI_ADMIN: 'KnowAI Admin',
  WASTE_MANAGER: 'Waste Manager',
  VOLUNTEER_COORDINATOR: 'Volunteer Coordinator',
  EVENT_ORGANIZER: 'Event Organizer',
  FINANCIAL_MANAGER: 'Financial Manager',
  APARTMENT_MANAGER: 'Apartment Manager',
  WEATHER_ANALYST: 'Weather Analyst',

  // Citizens & Users
  CITIZEN: 'Citizen',
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const isValidRole = (roleName: string): roleName is RoleName => {
  return Object.values(ROLES).includes(roleName as RoleName);
};

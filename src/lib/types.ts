// Types for API responses

export interface User {
  id: string;
  name: string;
  telephone: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  userTypeId: number | null;
  subscriptionId: number | null;
}

export interface UserResponse {
  user: User;
  properties: Property[];
}

export interface Property {
  id: number;
  address: string;
  surfaceArea: number;
  rent: number;
  numberOfBedrooms: number;
  estimatedCharges: number;
  propertyTypeId: number;
  ownerId: string;
}

// User type constants
export const USER_TYPES = {
  OWNER: 1,
  TENANT: 2,
  ADMIN: 3,
} as const; 
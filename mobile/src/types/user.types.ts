export type UserRole = "customer" | "provider";

export interface User {
  _id: string;
  fullName: string;
  phone?: string;
  email?: string;
  role: UserRole;
  profession?: string;
  subcity?: string;
  experience?: string;
  skills?: string[];
  kebeleIdUrl?: string;
  tradeCertUrl?: string;
  isVerified?: boolean;
  isAvailable?: boolean;
  rating?: number;
  connectsBalance?: number;
  isFeatured?: boolean;
  featuredUntil?: string | null;
  avatarUrl?: string;
  avatarPublicId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProviderDetails {
  _id: string;
  fullName: string;
  phone?: string;
  profession?: string;
  rating?: number;
  isVerified?: boolean;
  avatarUrl?: string;
}

export interface CustomerDetails {
  _id: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
}

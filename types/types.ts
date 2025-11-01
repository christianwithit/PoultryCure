// types/types.ts
export interface DiagnosisResult {
  id: string;
  type: 'symptom' | 'image';
  input: string;
  diagnosis: string;
  confidence: number;
  recommendations: string[];
  treatment?: string;
  prevention?: string;
  severity: 'low' | 'moderate' | 'high';
  date: string;
  imageUri?: string;
}

export interface Symptom {
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
}

export interface DiseaseInfo {
  name: string;
  symptoms: string[];
  treatment: string;
  prevention: string;
  severity: 'low' | 'moderate' | 'high';
  description: string;
  commonIn: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Authentication and User Management Types
export interface User {
  id: string;
  name: string;
  email: string;
  profilePhoto?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SessionData {
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  token?: string;
}

export interface EncryptedCredentials {
  hashedPassword: string;
  salt: string;
}

export interface UserProfile extends User {
  hashedPassword: string;
  salt: string;
  lastLoginAt?: Date;
}
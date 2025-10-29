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
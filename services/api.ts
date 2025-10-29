// services/api.ts
import { matchDisease } from '../data/disease';
import { ApiResponse, DiagnosisResult } from '../types/types';

// For now, using local diagnosis. Replace with actual API when available
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-api.com';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || '';

export class DiagnosisAPI {
  /**
   * Analyze symptoms using local disease matching
   * TODO: Replace with actual AI API call
   */
  static async analyzeSymptoms(symptoms: string): Promise<ApiResponse<DiagnosisResult>> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const matches = matchDisease(symptoms);

      if (matches.length === 0) {
        return {
          success: true,
          data: {
            id: Date.now().toString(),
            type: 'symptom',
            input: symptoms,
            diagnosis: 'No Specific Disease Identified',
            confidence: 0,
            recommendations: [
              'Monitor bird closely for 24-48 hours',
              'Ensure proper nutrition and clean water',
              'Isolate bird if symptoms worsen',
              'Consult with a veterinarian if concerned'
            ],
            severity: 'low',
            date: new Date().toISOString()
          }
        };
      }

      const topMatch = matches[0];
      
      return {
        success: true,
        data: {
          id: Date.now().toString(),
          type: 'symptom',
          input: symptoms,
          diagnosis: topMatch.disease,
          confidence: topMatch.confidence,
          recommendations: this.generateRecommendations(topMatch.info),
          treatment: topMatch.info.treatment,
          prevention: topMatch.info.prevention,
          severity: topMatch.info.severity,
          date: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Symptom analysis error:', error);
      return {
        success: false,
        error: 'Failed to analyze symptoms. Please try again.'
      };
    }
  }

  /**
   * Analyze image using AI
   * TODO: Implement actual image analysis API
   */
  static async analyzeImage(imageUri: string): Promise<ApiResponse<DiagnosisResult>> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // TODO: Replace with actual image analysis API call
      // Example implementation:
      /*
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'poultry.jpg',
      } as any);

      const response = await fetch(`${API_BASE_URL}/analyze-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      return { success: true, data };
      */

      // Mock response for now
      return {
        success: true,
        data: {
          id: Date.now().toString(),
          type: 'image',
          input: 'Image analysis',
          diagnosis: 'Image Analysis Available Soon',
          confidence: 0,
          recommendations: [
            'Image analysis feature is under development',
            'Please use symptom diagnosis for now',
            'Or consult with a veterinarian for visual examination'
          ],
          severity: 'low',
          date: new Date().toISOString(),
          imageUri
        }
      };
    } catch (error) {
      console.error('Image analysis error:', error);
      return {
        success: false,
        error: 'Failed to analyze image. Please try again.'
      };
    }
  }

  /**
   * Generate actionable recommendations based on disease info
   */
  private static generateRecommendations(diseaseInfo: any): string[] {
    const recommendations = [
      `Immediate isolation of affected bird(s)`,
      `Treatment: ${diseaseInfo.treatment}`,
      `Consult a veterinarian for proper diagnosis`,
    ];

    if (diseaseInfo.severity === 'high') {
      recommendations.unshift('⚠️ HIGH SEVERITY - Seek immediate veterinary attention');
      recommendations.push('Monitor entire flock closely');
      recommendations.push('Consider testing and culling if necessary');
    }

    return recommendations;
  }

  /**
   * Check API health/connectivity
   */
  static async checkConnection(): Promise<boolean> {
    try {
      // TODO: Implement actual health check
      return true;
    } catch {
      return false;
    }
  }
}
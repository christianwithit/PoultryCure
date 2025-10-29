// data/diseases.ts
import { DiseaseInfo } from '../types/types';

export const POULTRY_DISEASES: Record<string, DiseaseInfo> = {
  'Newcastle Disease': {
    name: 'Newcastle Disease',
    symptoms: [
      'respiratory distress',
      'diarrhea',
      'greenish watery droppings',
      'twisted neck',
      'paralysis',
      'decreased egg production',
      'soft-shelled eggs',
      'gasping',
      'coughing',
      'sneezing'
    ],
    treatment: 'No specific treatment. Supportive care with antibiotics to prevent secondary infections. Isolate affected birds immediately.',
    prevention: 'Regular vaccination (live or killed vaccines), strict biosecurity measures, quarantine new birds.',
    severity: 'high',
    description: 'A highly contagious viral disease affecting most bird species. Can cause up to 100% mortality in unvaccinated flocks.',
    commonIn: ['chickens', 'turkeys', 'ducks', 'geese']
  },
  
  'Fowl Cholera': {
    name: 'Fowl Cholera',
    symptoms: [
      'sudden death',
      'swelling of wattles',
      'swelling of joints',
      'fever',
      'greenish diarrhea',
      'loss of appetite',
      'ruffled feathers',
      'labored breathing',
      'mucus discharge from mouth'
    ],
    treatment: 'Antibiotics: Sulfonamides, Tetracyclines, or Penicillin. Early treatment is crucial for recovery.',
    prevention: 'Vaccination, good sanitation, proper ventilation, rodent control, avoid overcrowding.',
    severity: 'high',
    description: 'A bacterial disease caused by Pasteurella multocida. Can occur in acute or chronic forms.',
    commonIn: ['chickens', 'turkeys', 'ducks', 'geese']
  },

  'Infectious Bronchitis': {
    name: 'Infectious Bronchitis',
    symptoms: [
      'coughing',
      'sneezing',
      'nasal discharge',
      'gasping',
      'watery eyes',
      'decreased egg production',
      'soft-shelled eggs',
      'wrinkled eggs',
      'loss of appetite'
    ],
    treatment: 'No specific treatment. Provide supportive care, maintain optimal temperature, prevent secondary infections with antibiotics.',
    prevention: 'Vaccination at day-old and boosters, good ventilation, biosecurity measures.',
    severity: 'moderate',
    description: 'A highly contagious viral respiratory disease. Primarily affects the respiratory tract, but can also affect the reproductive system.',
    commonIn: ['chickens']
  },

  'Coccidiosis': {
    name: 'Coccidiosis',
    symptoms: [
      'bloody diarrhea',
      'droopiness',
      'loss of appetite',
      'ruffled feathers',
      'weight loss',
      'pale comb',
      'decreased growth',
      'huddling'
    ],
    treatment: 'Anticoccidial drugs: Amprolium, Sulfadimethoxine, or Toltrazuril. Provide clean water and electrolytes.',
    prevention: 'Coccidiostats in feed, good litter management, avoid dampness, gradual immunity development.',
    severity: 'moderate',
    description: 'A parasitic disease affecting the intestinal tract. Common in young birds (3-6 weeks old).',
    commonIn: ['chickens', 'turkeys', 'ducks', 'geese']
  },

  'Fowl Pox': {
    name: 'Fowl Pox',
    symptoms: [
      'wart-like nodules',
      'scabs on comb',
      'scabs on wattles',
      'scabs around eyes',
      'difficulty breathing',
      'decreased egg production',
      'weight loss',
      'yellow lesions in mouth'
    ],
    treatment: 'No specific treatment. Remove scabs with tweezers, apply iodine or antiseptic. Provide supportive care.',
    prevention: 'Vaccination, mosquito control, good sanitation, avoid introducing new birds without quarantine.',
    severity: 'moderate',
    description: 'A viral disease transmitted by mosquitoes or direct contact. Exists in dry (skin) and wet (diphtheritic) forms.',
    commonIn: ['chickens', 'turkeys', 'pigeons']
  },

  'Marek\'s Disease': {
    name: 'Marek\'s Disease',
    symptoms: [
      'paralysis of legs',
      'paralysis of wings',
      'twisted neck',
      'gray iris',
      'irregular pupil',
      'weight loss',
      'tumors',
      'depression'
    ],
    treatment: 'No treatment available. Cull severely affected birds to prevent disease spread.',
    prevention: 'Vaccination at hatch (day-old chicks), strict biosecurity, genetic resistance selection.',
    severity: 'high',
    description: 'A highly contagious viral disease causing tumors and paralysis. Affects young chickens (3-4 months).',
    commonIn: ['chickens']
  },

  'Infectious Coryza': {
    name: 'Infectious Coryza',
    symptoms: [
      'nasal discharge',
      'facial swelling',
      'swollen eyes',
      'foul smell',
      'decreased egg production',
      'loss of appetite',
      'sneezing',
      'rattling breathing'
    ],
    treatment: 'Antibiotics: Sulfadimethoxine, Erythromycin, or Trimethoprim. Treat entire flock.',
    prevention: 'All-in/all-out management, vaccination, avoid mixing different age groups, good ventilation.',
    severity: 'moderate',
    description: 'A bacterial respiratory disease causing characteristic facial swelling. Highly contagious within flocks.',
    commonIn: ['chickens']
  },

  'Avian Influenza': {
    name: 'Avian Influenza',
    symptoms: [
      'sudden death',
      'respiratory distress',
      'swelling of head',
      'blue discoloration of comb',
      'diarrhea',
      'decreased egg production',
      'soft-shelled eggs',
      'depression',
      'lack of coordination'
    ],
    treatment: 'No treatment. Highly reportable disease - contact veterinary authorities immediately. Quarantine and culling may be required.',
    prevention: 'Strict biosecurity, limit wild bird contact, vaccination in endemic areas, monitor and report suspicious deaths.',
    severity: 'high',
    description: 'A highly contagious viral disease. Low pathogenic strains cause mild symptoms; highly pathogenic strains cause severe disease and death.',
    commonIn: ['chickens', 'turkeys', 'ducks', 'geese', 'all poultry']
  }
};

// Helper function to match symptoms to diseases
export function matchDisease(symptomInput: string): {
  disease: string;
  confidence: number;
  info: DiseaseInfo;
}[] {
  const input = symptomInput.toLowerCase();
  const results: { disease: string; confidence: number; info: DiseaseInfo }[] = [];

  Object.entries(POULTRY_DISEASES).forEach(([diseaseName, diseaseInfo]) => {
    let matchCount = 0;
    let totalSymptoms = diseaseInfo.symptoms.length;

    diseaseInfo.symptoms.forEach(symptom => {
      if (input.includes(symptom.toLowerCase())) {
        matchCount++;
      }
    });

    if (matchCount > 0) {
      const confidence = Math.min((matchCount / totalSymptoms) * 100, 95);
      results.push({
        disease: diseaseName,
        confidence: Math.round(confidence),
        info: diseaseInfo
      });
    }
  });

  // Sort by confidence
  results.sort((a, b) => b.confidence - a.confidence);
  
  return results.slice(0, 3); // Return top 3 matches
}
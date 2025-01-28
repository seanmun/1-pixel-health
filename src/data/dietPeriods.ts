// src/data/dietPeriods.ts
import { DietComposition } from '../types';

export const DIET_PERIODS: { 
  startYear: number;
  endYear: number;
  composition: DietComposition;
}[] = [
  {
    startYear: -300000,
    endYear: 1800,
    composition: {
      animal: 60,
      vegetables: 20,
      fruits: 10,
      grains: 0,
      nuts: 10,
      seedOils: 0,
      processed: 0
    }
  },
  {
    startYear: 1800,
    endYear: 1900,
    composition: {
      animal: 30,
      vegetables: 15,
      fruits: 5,
      grains: 30,
      nuts: 5,
      seedOils: 10,
      processed: 5
    }
  },
  {
    startYear: 1900,
    endYear: 2025,
    composition: {
      animal: 20,
      vegetables: 10,
      fruits: 5,
      grains: 20,
      nuts: 5,
      seedOils: 20,
      processed: 20
    }
  }
];
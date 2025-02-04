// src/data/dietPeriods.ts
import { DietComposition } from '../types';

export const DIET_PERIODS: { 
  startYear: number;
  endYear: number;
  composition: DietComposition;
}[] = [
  {
    startYear: -300000,
    endYear: -50000,
    composition: {
      animal: 70,
      vegetables: 10,
      fruits: 10,
      grains: 5,
      nuts: 5,
      seedOils: 0,
      processed: 0
    }
  },
  {
    startYear: -50000,
    endYear: -20000,
    composition: {
      animal: 60,
      vegetables: 15,
      fruits: 15,
      grains: 5,
      nuts: 5,
      seedOils: 0,
      processed: 0
    }
  },
  {
    startYear: -20000,
    endYear: -10000,
    composition: {
      animal: 80,
      vegetables: 5,
      fruits: 5,
      grains: 5,
      nuts: 5,
      seedOils: 0,
      processed: 0
    }
  },
  {
    startYear: -10000,
    endYear: -5000,
    composition: {
      animal: 50,
      vegetables: 15,
      fruits: 10,
      grains: 15,
      nuts: 5,
      seedOils: 0,
      processed: 0
    }
  },
  {
    startYear: -5000,
    endYear: -1000,
    composition: {
      animal: 40,
      vegetables: 20,
      fruits: 10,
      grains: 20,
      nuts: 5,
      seedOils: 0,
      processed: 5
    }
  },
  {
    startYear: -1000,
    endYear: 1500,
    composition: {
      animal: 35,
      vegetables: 20,
      fruits: 10,
      grains: 25,
      nuts: 5,
      seedOils: 0,
      processed: 5
    }
  },
  {
    startYear: 1500,
    endYear: 1800,
    composition: {
      animal: 30,
      vegetables: 20,
      fruits: 15,
      grains: 25,
      nuts: 5,
      seedOils: 0,
      processed: 5
    }
  },
  {
    startYear: 1800,
    endYear: 1900,
    composition: {
      animal: 25,
      vegetables: 20,
      fruits: 15,
      grains: 30,
      nuts: 5,
      seedOils: 0,
      processed: 5
    }
  },
  {
    startYear: 1900,
    endYear: 1950,
    composition: {
      animal: 20,
      vegetables: 15,
      fruits: 15,
      grains: 30,
      nuts: 5,
      seedOils: 5,
      processed: 10
    }
  },
  {
    startYear: 1950,
    endYear: 2000,
    composition: {
      animal: 15,
      vegetables: 15,
      fruits: 10,
      grains: 30,
      nuts: 5,
      seedOils: 10,
      processed: 15
    }
  },
  {
    startYear: 2000,
    endYear: 2025,
    composition: {
      animal: 10,
      vegetables: 15,
      fruits: 10,
      grains: 30,
      nuts: 5,
      seedOils: 15,
      processed: 15
    }
  }
];

// Add some metadata about key transitions
export const SIGNIFICANT_CHANGES = [
  {
    year: -20000,
    description: "Peak Ice Age - Highest animal consumption"
  },
  {
    year: -10000,
    description: "Dawn of Agriculture - Introduction of grains"
  },
  {
    year: 1900,
    description: "Industrial Revolution - Introduction of seed oils"
  },
  {
    year: 1950,
    description: "Post-War - Rise of processed foods"
  }
];
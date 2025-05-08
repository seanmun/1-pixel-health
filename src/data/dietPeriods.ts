// === FILE: src/data/dietPeriods.ts ===
import { DietComposition, DietSource } from '../types';

export const DIET_PERIODS: {
  startYear: number;
  endYear: number;
  composition: DietComposition;
  sources?: DietSource[];
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
      processedTraditional: 0,
      processedModern: 0
    },
    sources: [
      { id: 'homo-sapiens-diet', note: 'Predominant reliance on animal-based diet.', type: 'archaeological' },
      { id: 'wooden-spears', note: 'Tool use improved hunting efficiency.', type: 'archaeological' },
      { id: 'fire-usage', note: 'Fire improved digestibility and safety.', type: 'archaeological' },
      { id: 'climate-fluctuations', note: 'Harsh environments demanded adaptability.', type: 'historical' },
      { id: 'symbolic-behavior', note: 'Symbolic thinking suggests knowledge-sharing.', type: 'speculative' }
    ]
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
      processedTraditional: 0,
      processedModern: 0
    },
    sources: [
      { id: 'climate-fluctuations', note: 'Colder Ice Age reduced plant diversity.', type: 'historical' },
      { id: 'fire-usage', note: 'Essential for survival in frigid climates.', type: 'archaeological' }
    ]
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
      processedTraditional: 0,
      processedModern: 0
    },
    sources: [
      { id: 'climate-fluctuations', note: 'Peak glacial conditions increased game reliance.', type: 'historical' },
      { id: 'fire-usage', note: 'Fire processed meats and tubers.', type: 'archaeological' }
    ]
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
      processedTraditional: 5,
      processedModern: 0
    },
    sources: [
      { id: 'climate-fluctuations', note: 'Warmer climates allowed farming.', type: 'historical' },
      { id: 'fire-usage', note: 'Used for early breadmaking.', type: 'archaeological' }
    ]
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
      processedTraditional: 5,
      processedModern: 0
    },
    sources: [
      { id: 'climate-fluctuations', note: 'Stable climates supported grain agriculture.', type: 'historical' },
      { id: 'fire-usage', note: 'Baking, brewing, and fermentation emerged.', type: 'archaeological' }
    ]
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
      processedTraditional: 5,
      processedModern: 0
    },
    sources: [
      { id: 'climate-fluctuations', note: 'Trade networks diversified crops.', type: 'historical' },
      { id: 'fire-usage', note: 'Urban food processing expanded.', type: 'archaeological' }
    ]
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
      processedTraditional: 5,
      processedModern: 0
    },
    sources: [
      { id: 'climate-fluctuations', note: 'Columbian Exchange expanded global diets.', type: 'historical' },
      { id: 'fire-usage', note: 'Traditional methods adapted to new ingredients.', type: 'archaeological' }
    ]
  },
  {
    startYear: 1800,
    endYear: 1900,
    composition: {
      animal: 25,
      vegetables: 20,
      fruits: 15,
      grains: 25,
      nuts: 5,
      seedOils: 0,
      processedTraditional: 5,
      processedModern: 5
    },
    sources: [
      { id: 'fire-usage', note: 'Mechanization began affecting food prep.', type: 'historical' },
      { id: 'climate-fluctuations', note: 'Colonial trade expanded ingredient access.', type: 'historical' }
    ]
  },
  {
    startYear: 1900,
    endYear: 1950,
    composition: {
      animal: 20,
      vegetables: 15,
      fruits: 10,
      grains: 25,
      nuts: 5,
      seedOils: 5,
      processedTraditional: 5,
      processedModern: 15
    },
    sources: [
      { id: 'fire-usage', note: 'Refined foods and additives gained popularity.', type: 'historical' },
      { id: 'climate-fluctuations', note: 'World wars accelerated modern food tech.', type: 'historical' }
    ]
  },
  {
    startYear: 1950,
    endYear: 2000,
    composition: {
      animal: 15,
      vegetables: 10,
      fruits: 5,
      grains: 25,
      nuts: 5,
      seedOils: 10,
      processedTraditional: 5,
      processedModern: 25
    },
    sources: [
      { id: 'fire-usage', note: 'Mass production and packaged meals grew.', type: 'historical' },
      { id: 'climate-fluctuations', note: 'Agricultural industrialization scaled up.', type: 'historical' }
    ]
  },
  {
    startYear: 2000,
    endYear: 2025,
    composition: {
      animal: 10,
      vegetables: 10,
      fruits: 5,
      grains: 20,
      nuts: 5,
      seedOils: 15,
      processedTraditional: 5,
      processedModern: 30
    },
    sources: [
      { id: 'fire-usage', note: 'Ultra-processed foods dominate diets.', type: 'nutritional' },
      { id: 'climate-fluctuations', note: 'Convenience culture drives food behavior.', type: 'historical' }
    ]
  }
];

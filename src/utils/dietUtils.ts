import { DIET_PERIODS } from '../data/dietPeriods';
import { DietComposition } from '../types';

const easeInOutQuad = (t: number): number => {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
};

export const getDietData = (year: number): DietComposition => {
  const currentPeriodIndex = DIET_PERIODS.findIndex(period => 
    year >= period.startYear && year <= period.endYear
  );

  if (currentPeriodIndex === -1) {
    return DIET_PERIODS[0].composition;
  }

  const currentPeriod = DIET_PERIODS[currentPeriodIndex];
  const nextPeriod = DIET_PERIODS[currentPeriodIndex + 1];

  // Handle transitions
  if (nextPeriod && year >= currentPeriod.endYear - 100) {
    const transitionProgress = (year - (currentPeriod.endYear - 100)) / 100;
    const eased = easeInOutQuad(Math.min(1, Math.max(0, transitionProgress)));
    
    return Object.keys(currentPeriod.composition).reduce((result, key) => {
      const dietKey = key as keyof DietComposition;
      const start = currentPeriod.composition[dietKey];
      const end = nextPeriod.composition[dietKey];
      result[dietKey] = start + (end - start) * eased;
      return result;
    }, {} as DietComposition);
  }

  return currentPeriod.composition;
};

export const formatCategory = (category: string): string => 
  category.charAt(0).toUpperCase() + category.slice(1);

export const getDietColor = (category: string): string => ({
  animal: '#FF6B6B',
  vegetables: '#4ECB71',
  fruits: '#FFA94D',
  grains: '#FFD93D',
  nuts: '#A8855D',
  seedOils: '#8B3DE4',
  processed: '#2563EB'
}[category] || '#000000');
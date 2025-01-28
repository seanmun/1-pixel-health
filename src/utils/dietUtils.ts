// src/utils/dietUtils.ts
import { DIET_PERIODS } from '../data/dietPeriods';

export const getDietData = (year: number) => {
  // Find the current period
  const currentPeriodIndex = DIET_PERIODS.findIndex(period => 
    year >= period.startYear && year <= period.endYear
  );

  if (currentPeriodIndex === -1) {
    return DIET_PERIODS[0].composition;
  }

  const currentPeriod = DIET_PERIODS[currentPeriodIndex];
  const nextPeriod = DIET_PERIODS[currentPeriodIndex + 1];

  // If we're near a transition point (within 50 years)
  if (nextPeriod && year >= currentPeriod.endYear - 50) {
    const transitionProgress = (year - (currentPeriod.endYear - 50)) / 100;
    
    return Object.keys(currentPeriod.composition).reduce((result, key) => {
      const dietKey = key as keyof typeof currentPeriod.composition;
      const start = currentPeriod.composition[dietKey];
      const end = nextPeriod.composition[dietKey];
      result[dietKey] = start + (end - start) * Math.min(1, Math.max(0, transitionProgress));
      return result;
    }, {} as typeof currentPeriod.composition);
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
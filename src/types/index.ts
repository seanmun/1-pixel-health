export interface DietComposition {
    animal: number;
    vegetables: number;
    fruits: number;
    grains: number;
    nuts: number;
    seedOils: number;
    processed: number;
  }
  
  export interface VisibleRange {
    start: number;
    end: number;
  }
  
  export interface HistoricalStats {
    lifeExpectancy: number;
    infantMortality: number;
    populationSize?: number;
  }
  
  export interface TimelineEvent {
    year: number;
    type: 'popup' | 'stat-change' | 'diet-change';
    content: {
      message?: string;
      stats?: HistoricalStats;
      dietComposition?: DietComposition;
    };
  }
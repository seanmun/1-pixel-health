// src/components/Timeline.tsx
import { useState, useEffect } from 'react';

interface DietData {
  animalProducts: number;
  vegetables: number;
  fruits: number;
  grains: number;
  nuts: number;
  seedOils: number;
  processedFoods: number;
}

const getCumulativeHeight = (data: DietData, currentIndex: number): number => {
  return Object.values(data)
    .slice(0, currentIndex)
    .reduce((sum, value) => sum + value, 0);
};

const Timeline = () => {
    const [year, setYear] = useState(-500000);
    const TOTAL_YEARS = 502025;
    const PIXEL_TO_YEAR_RATIO = 1;
  

  const getDietData = (year: number): DietData => {
    if (year >= 2000) {
      return {
        animalProducts: 20,
        vegetables: 10,
        fruits: 5,
        grains: 20,
        nuts: 5,
        seedOils: 20,
        processedFoods: 20
      };
    }
    if (year >= 1900) {
      return {
        animalProducts: 30,
        vegetables: 15,
        fruits: 5,
        grains: 30,
        nuts: 5,
        seedOils: 10,
        processedFoods: 5
      };
    }
    // Pre-industrial diet
    return {
      animalProducts: 60,
      vegetables: 20,
      fruits: 10,
      grains: 0,
      nuts: 10,
      seedOils: 0,
      processedFoods: 0
    };
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollElement = document.documentElement;
      const maxScroll = scrollElement.scrollWidth - scrollElement.clientWidth;
      const scrollPercentage = window.scrollX / maxScroll;
      const yearRange = 502025; // Total range from -500000 to 2025
      const newYear = -500000 + Math.floor(scrollPercentage * yearRange);
      setYear(Math.min(2025, Math.max(-500000, newYear)));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const dietData = getDietData(year);

  return (
    // In Timeline.tsx, update the main container div:
    <div className="w-full overflow-x-scroll h-screen"> {/* Full viewport height */}
      <div 
        className="h-[80vh] relative" 
        style={{ width: `${TOTAL_YEARS * PIXEL_TO_YEAR_RATIO}px` }}
      >
        {Object.entries(dietData).map(([category, percentage], index) => (
          <div 
            key={category}
            className="absolute transition-opacity duration-300"
            style={{
              top: 0,
              width: '100%',
              height: `${percentage}%`, // Height based on percentage
              transform: `translateY(${getCumulativeHeight(dietData, index)}%)`,
              backgroundColor: getDietColor(category)
            }}
          >
            <div className="sticky left-0 text-sm text-white p-1 bg-black bg-opacity-50">
              {formatCategory(category)}: {percentage}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const getDietColor = (category: string): string => ({
  animalProducts: '#FF6B6B',
  vegetables: '#4ECB71',
  fruits: '#FFA94D',
  grains: '#FFD93D',
  nuts: '#A8855D',
  seedOils: '#FF4040',
  processedFoods: '#8B4513'
}[category] || '#000000');

const formatCategory = (category: string): string => 
  category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

export default Timeline;
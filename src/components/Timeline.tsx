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
<div className="w-full h-screen flex flex-col">
 {/* Legend bar */}
 <div className="flex gap-4 p-2 bg-white border-b text-sm">
   {Object.keys(dietData).map(category => (
     <div key={category} className="flex items-center gap-1">
       <div 
         className="w-3 h-3 rounded-full" 
         style={{ backgroundColor: getDietColor(category) }} 
       />
       <span className="text-xs">{formatCategory(category)}</span>
     </div>
   ))}
 </div>
 
 {/* Graph section */}
 <div className="h-[45vh] overflow-x-scroll relative">
   <div 
     className="h-full"
     style={{ width: `${TOTAL_YEARS * PIXEL_TO_YEAR_RATIO}px` }}
   >
     {Object.entries(dietData).map(([category, percentage], index) => (
 <div 
   key={category}
   className="absolute w-full transition-opacity duration-300"
   style={{
     top: `${getCumulativeHeight(dietData, index)}%`,
     height: `${percentage}%`,
     backgroundColor: getDietColor(category)
   }}
 >
   <div className="sticky left-4 text-xs text-white px-2 py-1 bg-black bg-opacity-50 rounded"
     style={{ 
       position: 'absolute',
       top: '50%',
       transform: 'translateY(-50%)',
       display: percentage < 2 ? 'none' : 'block'
     }}>
     {formatCategory(category)} ({percentage}%)
   </div>
 </div>
))}
   </div>
        
        <div className="fixed flex justify-between w-full px-4 py-2 bg-gray-100 border-y border-gray-300">
          <div className="bg-white p-2 rounded shadow">
            Viewing: {Math.max(-500000, year - Math.floor(window.innerWidth/2))} BCE
          </div>
          <div className="bg-white p-2 rounded shadow">
            to {Math.min(2025, year + Math.floor(window.innerWidth/2))} {year + Math.floor(window.innerWidth/2) > 0 ? 'CE' : 'BCE'}
          </div>
        </div>
      </div>
      
      <div className="flex-1 bg-white p-4">
        <div className="text-2xl font-bold text-center">
          Current Year: {year > 0 ? year + ' CE' : Math.abs(year) + ' BCE'}
        </div>
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
  seedOils: '#8B3DE4', // Purple
  processedFoods: '#2563EB' // Blue
 }[category] || '#000000');

const formatCategory = (category: string): string => 
  category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

export default Timeline;
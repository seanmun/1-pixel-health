import { getDietColor, getDietData } from '../utils/dietUtils';

interface Props {
  year: number;
}

const DietVisualization = ({ year }: Props) => {
  const dietData = getDietData(year);
  console.log('Year received:', year);
  console.log('Diet Data:', dietData);

  return (
    <div className="h-full relative bg-red-500"> {/* Bright color to ensure visibility */}
      <div className="absolute top-0 left-0 text-black">Debug: Data is rendering</div>
      {Object.entries(dietData).map(([category, percentage], index) => {
        console.log(`Processing ${category} with ${percentage}%`);
        
        const previousHeight = Object.entries(dietData)
          .slice(0, index)
          .reduce((sum, entry) => sum + entry[1], 0);

        return (
          <div 
            key={category}
            className="absolute w-full transition-all duration-500"
            style={{
              top: `${previousHeight}%`,
              height: `${percentage}%`,
              backgroundColor: getDietColor(category),
              border: '2px solid black'
            }}
          >
            <span className="text-white">{category}</span>
          </div>
        );
      })}
    </div>
  );
};

export default DietVisualization;
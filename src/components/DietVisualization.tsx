// src/components/DietVisualization.tsx
import { getDietColor, getDietData } from '../utils/dietUtils';

interface Props {
  year: number;
}

interface Layer {
  category: string;
  startY: number;
  endY: number;
  color: string;
}

const DietVisualization = ({ year }: Props) => {
  const dietData = getDietData(year);
  const width = 302025;
  const svgHeight = 100;

  // Calculate layers from bottom to top
  const calculateLayers = (): Layer[] => {
    let currentY = 100; // Start from bottom
    const layers: Layer[] = [];

    Object.entries(dietData).forEach(([category, percentage]) => {
      const layerHeight = percentage; // Height based on percentage
      layers.push({
        category,
        startY: currentY - layerHeight, // Top of this layer
        endY: currentY, // Bottom of this layer
        color: getDietColor(category)
      });
      currentY -= layerHeight; // Move up for next layer
      console.log(`${category}: ${percentage}% - Y from ${currentY} to ${currentY + layerHeight}`);
    });

    return layers;
  };

  const layers = calculateLayers();

  return (
    <div className="h-full">
      <svg 
        width={width} 
        height="100%" 
        viewBox={`0 0 ${width} ${svgHeight}`}
        preserveAspectRatio="none"
      >
        {layers.map((layer) => (
          <rect
            key={layer.category}
            x="0"
            y={layer.startY + "%"}
            width="100%"
            height={`${layer.endY - layer.startY}%`}
            fill={layer.color}
            className="transition-all duration-500"
          />
        ))}
      </svg>
    </div>
  );
};

export default DietVisualization;
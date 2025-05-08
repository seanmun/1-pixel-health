import { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts';
import { getDietColor, getDietData, formatCategory } from '../utils/dietUtils';
import { DIET_PERIODS } from '../data/dietPeriods';
import { DietComposition } from '../types';

interface DataPoint extends DietComposition {
  year: number;
}

interface CustomTooltipPayload {
  value: number;
  name: string;
  color: string;
}

const formatYear = (year: number) => {
  return year > 0 ? `${year} CE` : `${Math.abs(year)} BCE`;
};

const CustomTooltip = ({ 
  active, 
  payload, 
  label 
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const typedPayload = payload as CustomTooltipPayload[];
    const year = Number(label);
    
    // Create a custom order for the tooltip
    const orderedPayload = [...typedPayload];
    // Sort according to our desired order
    orderedPayload.sort((a, b) => {
      const order = ['animal', 'vegetables', 'fruits', 'nuts', 'grains', 'seedOils', 'processedTraditional', 'processedModern'];
      return order.indexOf(a.name) - order.indexOf(b.name);
    });
    
    return (
      <div className="bg-white shadow-xl rounded-lg p-3 border border-gray-200 max-w-xs">
        <p className="font-semibold mb-2">
          {formatYear(year)}
        </p>
        {orderedPayload.map((entry) => (
          entry.value > 0.01 && (
            <div key={entry.name} className="flex items-center gap-2 my-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }} 
              />
              <span className="text-sm">
                {formatCategory(entry.name)}: {Math.round(entry.value)}%
              </span>
            </div>
          )
        ))}
      </div>
    );
  }
  return null;
};

const DietVisualization = () => {
  const data = useMemo(() => {
    const points: DataPoint[] = [];
    const allYears: number[] = [];
    
    // Ensure we have exact boundary points
    allYears.push(-300000);
    allYears.push(2025);
    
    // Add points around transition periods
    DIET_PERIODS.forEach((period, index) => {
      if (index < DIET_PERIODS.length - 1) {
        // Add transition points
        for (let y = period.endYear - 100; y < period.endYear; y += 2) {
          allYears.push(y);
        }
        for (let y = period.endYear; y < period.endYear + 100; y += 2) {
          allYears.push(y);
        }
      }
    });

    // Add regular interval points
    const step = 500;
    for (let y = -300000; y <= 2025; y += step) {
      allYears.push(y);
    }

    // Add extra resolution for recent history
    for (let y = 1800; y <= 2025; y += 5) {
      allYears.push(y);
    }

    // Sort and remove duplicates
    const uniqueYears = [...new Set(allYears)].sort((a, b) => a - b);
    
    // Generate data points
    uniqueYears.forEach(y => {
      if (y >= -300000 && y <= 2025) {
        // Get the composition data
        const composition = getDietData(y);
        
        // Ensure values sum to 100
        const sum = Object.values(composition).reduce((acc, val) => acc + val, 0);
        if (Math.abs(sum - 100) > 0.1) {
          // Normalize to ensure exactly 100%
          Object.keys(composition).forEach(key => {
            composition[key as keyof DietComposition] = 
              (composition[key as keyof DietComposition] / sum) * 100;
          });
        }
        
        points.push({
          year: y,
          ...composition
        });
      }
    });

    return points;
  }, []);

  // Updated categories with separate processing types
  const categories = [
    'processedModern', 
    'processedTraditional', 
    'seedOils', 
    'grains', 
    'nuts', 
    'fruits', 
    'vegetables', 
    'animal'
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        stackOffset="expand"
      >
        <XAxis 
          dataKey="year"
          type="number"
          domain={[-300000, 2025]}
          scale="linear"
          hide={true}
          allowDataOverflow={false}
          interval="preserveStart"
        />
        <YAxis 
          domain={[0, 1]}
          hide={true}
        />
        <Tooltip 
          content={<CustomTooltip />}
          labelFormatter={(label) => String(label)}
        />
        {categories.map((category) => (
          <Area
            key={category}
            type="monotone"
            dataKey={category}
            stackId="1"
            stroke={getDietColor(category)}
            fill={getDietColor(category)}
            isAnimationActive={false}
            connectNulls={true}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default DietVisualization;
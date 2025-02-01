import { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, TooltipProps, XAxis } from 'recharts';
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
    
    return (
      <div className="bg-white shadow-xl rounded-lg p-3 border border-gray-200">
        <p className="font-semibold mb-2">
          {formatYear(year)}
        </p>
        {typedPayload.reverse().map((entry) => (
          entry.value > 0.01 && (
            <div key={entry.name} className="flex items-center gap-2 my-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }} 
              />
              <span className="text-sm">
                {formatCategory(entry.name)}: {(entry.value * 100).toFixed(1)}%
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
    
    // Add points around transition periods
    DIET_PERIODS.forEach((period, index) => {
      if (index < DIET_PERIODS.length - 1) {
        // Add points before transition
        for (let y = period.endYear - 100; y < period.endYear; y += 2) {
          if (!allYears.includes(y)) {
            allYears.push(y);
          }
        }
        // Add points after transition
        for (let y = period.endYear; y < period.endYear + 100; y += 2) {
          if (!allYears.includes(y)) {
            allYears.push(y);
          }
        }
      }
    });

    // Add regular interval points
    const step = 500;
    for (let y = -300000; y <= 2025; y += step) {
      if (!allYears.includes(y)) {
        allYears.push(y);
      }
    }

    // Sort years and generate data points
    allYears.sort((a, b) => a - b);
    allYears.forEach(y => {
      const composition = getDietData(y);
      points.push({
        year: y,
        ...composition
      });
    });

    return points;
  }, []);

  const categories = ['processed', 'seedOils', 'grains', 'nuts', 'fruits', 'vegetables', 'animal'];

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
          hide={true}  // Hide the axis but use it for scaling
        />
        <Tooltip 
          content={<CustomTooltip />}
          labelFormatter={(label) => String(label)}  // Ensure label is passed as-is
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
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default DietVisualization;
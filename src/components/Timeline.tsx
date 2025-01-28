import { useState, useEffect } from 'react';
import { VisibleRange, TimelineEvent } from '../types';
import { getDietData, formatCategory, getDietColor } from '../utils/dietUtils';
import { TIMELINE_EVENTS } from '../data/timelineEvents';
import DietVisualization from './DietVisualization';
import Popup from './Popup';

const Timeline = () => {
  const [visibleRange, setVisibleRange] = useState<VisibleRange>({
    start: -300000,
    end: -299000
  });
  const [currentEvent, setCurrentEvent] = useState<TimelineEvent | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const container = document.querySelector('.timeline-scroll');
      if (!container) return;

      const scrollPercentage = container.scrollLeft / (container.scrollWidth - container.clientWidth);
      const totalYears = 302025;
      const start = -300000 + Math.floor(scrollPercentage * totalYears);
      const viewportYears = 1000;

      setVisibleRange({
        start: Math.max(-300000, start),
        end: Math.min(2025, start + viewportYears)
      });
    };

    const container = document.querySelector('.timeline-scroll');
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    // Find event for current year
    const event = TIMELINE_EVENTS.find(
      event => event.year === visibleRange.start && event.type === 'popup'
    );

    if (event) {
      setCurrentEvent(event);
      // Auto-hide popup after 5 seconds
      const timer = setTimeout(() => setCurrentEvent(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [visibleRange.start]);

  const dietData = getDietData(visibleRange.start);

  return (
    <div className="h-screen flex flex-col">
      {/* Fixed legend above graph */}
      <div className="h-12 bg-white border-b text-sm text-black shadow-md">
        <div className="flex flex-wrap gap-2 p-2 justify-center md:justify-start">
          {Object.entries(dietData).map(([category, percentage]) => (
            percentage > 3 && (
              <div key={category} className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: getDietColor(category) }} 
                />
                <span className="text-[10px] md:text-xs">
                  {formatCategory(category)} ({Math.round(percentage)}%)
                </span>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Graph section */}
      <div className="h-[45vh] overflow-x-auto timeline-scroll">
        <div className="h-full" style={{ width: '302025px' }}>
          <DietVisualization year={visibleRange.start} />
        </div>
      </div>

      {/* Year display */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 text-black">
        <div className="text-2xl font-bold text-center">
          {visibleRange.start > 0 ? `${visibleRange.start} CE` : `${Math.abs(visibleRange.start)} BCE`}
        </div>
      </div>

      {/* Popup */}
      {currentEvent?.type === 'popup' && currentEvent.content.message && (
        <Popup 
          message={currentEvent.content.message}
          onClose={() => setCurrentEvent(null)}
        />
      )}
    </div>
  );
};

export default Timeline;
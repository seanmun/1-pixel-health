import { useState, useEffect } from 'react';
import { VisibleRange, TimelineEvent } from '../types';
import { getDietColor, formatCategory } from '../utils/dietUtils';
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

  const [showInstructions, setShowInstructions] = useState(true);


  // In Timeline.tsx, update the existing useEffect or add a new one
  useEffect(() => {
    // Find event near current year (within 50 years)
    const nearbyEvent = TIMELINE_EVENTS.find(
      event => Math.abs(event.year - visibleRange.start) < 50 && 
      event.type === 'popup'
    );
  
    const shouldShowEvent = nearbyEvent && 
      (!currentEvent || currentEvent.year !== nearbyEvent.year);
  
    if (shouldShowEvent) {
      setCurrentEvent(nearbyEvent);
      
      const timer = setTimeout(() => {
        setCurrentEvent(null);
      }, 5000);
  
      return () => clearTimeout(timer);
    }
  }, [visibleRange.start, currentEvent]);



  return (
    <div className="h-screen flex flex-col">
      {/* Fixed legend above graph */}


      {/* Scroll indicators */}
      <div className="fixed right-6 
                bg-white shadow-lg rounded-full p-3
                text-gray-600 flex flex-col items-center
                animate-pulse"
     style={{ top: 'calc(12px + (45vh / 2))', transform: 'translateY(-50%)' }}>
  <div className="text-sm mb-2">Scroll</div>
  <div className="flex items-center gap-1">
    <span className="font-bold">shift</span>
    <span>+</span>
    <svg 
      className="w-5 h-5" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
    >
      <path d="M4 12h16m0 0l-6-6m6 6l-6 6"/>
    </svg>
  </div>
</div>

      {showInstructions && (
      <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 
                      text-white px-4 py-2 rounded-lg z-50 text-sm">
        Hold Shift + Mouse Wheel to scroll through time
        <button 
          onClick={() => setShowInstructions(false)}
          className="ml-3 opacity-50 hover:opacity-100"
        >
          ×
        </button>
      </div>
    )}

    {/* Graph section with legend */}
    <div className="h-[45vh] overflow-x-auto timeline-scroll">
      {/* Legend - sticky and always visible */}
      <div className="h-8 bg-white border-b border-gray-200 sticky top-0 left-0 z-10">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 px-2 py-1">
          {['processed', 'seedOils', 'grains', 'nuts', 'fruits', 'vegetables', 'animal'].map((category) => (
            <div key={category} className="flex items-center gap-1">
              <div 
                className="w-2 h-2 rounded-full shrink-0" 
                style={{ backgroundColor: getDietColor(category) }} 
              />
              <span className="text-xs font-medium whitespace-nowrap">
                {formatCategory(category)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Visualization with remaining height */}
      <div className="h-[calc(45vh-2rem)]" style={{ width: '302025px' }}>
        <DietVisualization />
      </div>
    </div>

          {/* Year range display - positioned below graph */}
    <div className="fixed flex justify-between w-full px-4 py-2 bg-gray-100 border-y border-gray-300" 
         style={{ top: 'calc(45vh + 48px)' }}> {/* 48px accounts for legend height */}
      <div className="bg-white p-2 rounded shadow text-black">
        Left: {Math.max(-300000, visibleRange.start - Math.floor(window.innerWidth/2))} BCE
      </div>
      <div className="bg-white p-2 rounded shadow text-black">
        Right: {Math.min(2025, visibleRange.start + Math.floor(window.innerWidth/2))} 
        {visibleRange.start + Math.floor(window.innerWidth/2) > 0 ? 'CE' : 'BCE'}
      </div>
    </div>

      {/* Year display */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 text-black">
        <div className="text-2xl font-bold text-center">
          {visibleRange.start > 0 ? `${visibleRange.start} CE` : `${Math.abs(visibleRange.start)} BCE`}
        </div>
      </div>

      {/* Popup */}
      {currentEvent?.type === 'popup' && (
      <Popup 
        message={currentEvent.content.message || ''}
        onClose={() => setCurrentEvent(null)}
      />
      )}
    </div>
  );
};

export default Timeline;
import { useState, useEffect } from 'react';
import { VisibleRange, TimelineEvent } from '../types';
import { getDietColor, formatCategory } from '../utils/dietUtils';
import { TIMELINE_EVENTS } from '../data/timelineEvents';
import DietVisualization from './DietVisualization';
import Popup from './Popup';
import { useRef, useCallback } from 'react';


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


// Inside Timeline component, add these:
const scrollContainerRef = useRef<HTMLDivElement>(null);
const lastScrollTime = useRef<number>(0);
const lastScrollPosition = useRef<number>(0);
const isInDecelerationZone = useRef<boolean>(false);

const handleScroll = useCallback((e: Event) => {
  const container = e.target as HTMLElement;
  const currentTime = Date.now();
  const currentPosition = container.scrollLeft;
  const timeDiff = currentTime - lastScrollTime.current;
  
  // Calculate scroll speed (pixels per millisecond)
  const scrollSpeed = Math.abs(currentPosition - lastScrollPosition.current) / timeDiff;
  
  // Convert scroll position to year
  const currentYear = -300000 + Math.floor(currentPosition);
  
  // Check if we're near any major time periods (within 1000 years)
  const nearestEvent = TIMELINE_EVENTS.find(event => 
    Math.abs(event.year - currentYear) < 1000
  );

  if (nearestEvent && scrollSpeed > 0.1 && !isInDecelerationZone.current) {
    // We're entering a deceleration zone
    isInDecelerationZone.current = true;
    
    const targetScroll = nearestEvent.year + 300000; // Convert year to scroll position
    
    container.style.scrollBehavior = 'smooth';
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });

    // Reset after the deceleration period
    setTimeout(() => {
      container.style.scrollBehavior = 'auto';
      isInDecelerationZone.current = false;
    }, 2000); // 2 second pause
  }

  lastScrollTime.current = currentTime;
  lastScrollPosition.current = currentPosition;
}, []);

useEffect(() => {
  const container = scrollContainerRef.current;
  if (container) {
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }
}, [handleScroll]);

  // In Timeline.tsx, update the event handling
useEffect(() => {
  // Find the current event based on year ranges
  const currentYear = visibleRange.start;
  
  // Find the appropriate event for the current year
  const currentEvent = TIMELINE_EVENTS.reduce((closest, event) => {
    if (event.year <= currentYear) {
      // If this event is before or at our current year and is more recent than our previous closest
      return (!closest || event.year > closest.year) ? event : closest;
    }
    return closest;
  }, null as TimelineEvent | null);

  if (currentEvent) {
    setCurrentEvent(currentEvent);
  }
}, [visibleRange.start]); // Only depend on the start year



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
<div 
  ref={scrollContainerRef}
  className="h-[45vh] overflow-x-auto timeline-scroll"
  style={{ scrollBehavior: 'auto' }}
>
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

  {/* Visualization with remaining height and snap points */}
  <div className="h-[calc(45vh-2rem)]" style={{ width: '302025px', position: 'relative' }}>
    {/* Add snap points for each event */}
    {TIMELINE_EVENTS.map((event) => (
      <div
        key={event.year}
        className="absolute top-0 bottom-0 w-1"
        style={{ 
          left: `${event.year + 300000}px`,
          scrollSnapAlign: 'center',
          opacity: 0 // Make the snap points invisible
        }}
      />
    ))}
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
        />
      )}
    </div>
  );
};

export default Timeline;
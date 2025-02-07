import { useState, useEffect } from 'react';
import { VisibleRange, TimelineEvent } from '../types';
import { getDietColor, formatCategory } from '../utils/dietUtils';
import { TIMELINE_EVENTS } from '../data/timelineEvents';
import DietVisualization from './DietVisualization';
import { useRef, useCallback } from 'react';


const Timeline = () => {
  const [visibleRange, setVisibleRange] = useState<VisibleRange>({
    start: -300000,
    end: -299000
  });

  
  // Replace currentEvent state with
// Add this state
const [activeCards, setActiveCards] = useState<TimelineEvent[]>([]);

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
    const newEvent = TIMELINE_EVENTS.reduce((closest, event) => {
      if (event.year <= currentYear) {
        return (!closest || event.year > closest.year) ? event : closest;
      }
      return closest;
    }, null as TimelineEvent | null);
  
    if (newEvent) {
      // Only add the card if it's not already in activeCards
      if (activeCards.length === 0 || newEvent.year !== activeCards[activeCards.length - 1].year) {
        if (activeCards.length === 0) {
          // First card - add without animation
          setActiveCards([newEvent]);
        } else {
          // Add new card to stack
          setActiveCards(prev => [...prev, newEvent]);
        }
      }
    }
  }, [visibleRange.start, activeCards]);


  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Fixed legend at top */}
      <div className="flex-none bg-white border-b border-gray-200">
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
  
      {/* Graph section with year overlay */}
      <div className="relative h-[45vh] overflow-hidden">
        <div 
          ref={scrollContainerRef}
          className="h-full overflow-x-auto overflow-y-hidden timeline-scroll"
          style={{ scrollBehavior: 'auto' }}
        >
          <div className="h-full" style={{ width: '302025px' }}>
            <DietVisualization />
          </div>
        </div>
  
        {/* Year overlay */}
        <div className="absolute bottom-2 left-0 right-0 px-4">
          <div className="flex justify-between text-sm">
            <div className="bg-black bg-opacity-80 text-white px-2 py-1 rounded">
              {Math.max(-300000, visibleRange.start)} BCE
            </div>
            <div className="bg-black bg-opacity-80 text-white px-2 py-1 rounded">
              {visibleRange.start + Math.floor(window.innerWidth/2)} 
              {visibleRange.start + Math.floor(window.innerWidth/2) > 0 ? ' CE' : ' BCE'}
            </div>
            <div className="bg-black bg-opacity-80 text-white px-2 py-1 rounded">
              {Math.min(2025, visibleRange.start + window.innerWidth)} 
              {visibleRange.start + window.innerWidth > 0 ? ' CE' : ' BCE'}
            </div>
          </div>
        </div>
      </div>
  
{/* Bottom section for additional information */}
<div className="flex-1 bg-gray-50 overflow-y-auto">
  {/* Card Stack */}
  <div className="p-4">
    <div className="relative max-w-sm md:max-w-md mx-auto" style={{ height: '200px' }}>
      {activeCards && activeCards.map((card: TimelineEvent, index: number) => (
        <div
          key={card.year}
          className={`absolute w-full bg-black bg-opacity-80 text-white p-4 rounded-lg shadow-lg transform transition-all duration-500 
            ${index === activeCards.length - 1 ? 'card-enter border-2 border-white/30' : ''}`}
          style={{
            transform: `translateY(${(activeCards.length - index - 1) * 4}px) translateX(${(activeCards.length - index - 1) * 4}px)`,
            zIndex: index,
            backgroundColor: `rgba(0, 0, 0, ${0.8 - (activeCards.length - index - 1) * 0.1})` // Slightly vary the opacity
          }}
        >
          <div className="text-sm text-gray-300 mb-2">
            {card.year > 0 ? `${card.year} CE` : `${Math.abs(card.year)} BCE`}
          </div>
          <div className="text-sm md:text-base">
            {card.content.message || ''}
          </div>
        </div>
      ))}
    </div>
  </div>
</div>


    </div>
  );
};

export default Timeline;
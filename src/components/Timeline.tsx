import { useState, useEffect, useRef, useCallback } from 'react';
import { VisibleRange, TimelineEvent } from '../types';
import { getDietColor, formatCategory } from '../utils/dietUtils';
import { TIMELINE_EVENTS } from '../data/timelineEvents';
import DietVisualization from './DietVisualization';

const Timeline = () => {
  const [visibleRange, setVisibleRange] = useState<VisibleRange>({
    start: -300000,
    end: -299000
  });
  const [activeCards, setActiveCards] = useState<TimelineEvent[]>([]);
  const [showScrollHint, setShowScrollHint] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowScrollHint(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef<number>(0);
  const lastScrollPosition = useRef<number>(0);
  const isInDecelerationZone = useRef<boolean>(false);

  const handleScroll = useCallback((e: Event) => {
    const container = e.target as HTMLElement;
    const currentScroll = container.scrollLeft;

    const totalYears = 302025;
    const scrollPercentage = currentScroll / (container.scrollWidth - container.clientWidth);
    const startYear = -300000 + Math.floor(scrollPercentage * totalYears);
    const viewportYears = 1000;

    setVisibleRange({
      start: Math.max(-300000, startYear),
      end: Math.min(2025, startYear + viewportYears)
    });

    const currentTime = Date.now();
    const timeDiff = currentTime - lastScrollTime.current;
    const scrollSpeed = Math.abs(currentScroll - lastScrollPosition.current) / timeDiff;
    const currentYear = -300000 + Math.floor(currentScroll);

    const nearestEvent = TIMELINE_EVENTS.find(event => Math.abs(event.year - currentYear) < 1000);

    if (nearestEvent && scrollSpeed > 0.1 && !isInDecelerationZone.current) {
      isInDecelerationZone.current = true;
      const targetScroll = nearestEvent.year + 300000;
      container.style.scrollBehavior = 'smooth';
      container.scrollTo({ left: targetScroll, behavior: 'smooth' });
      setTimeout(() => {
        container.style.scrollBehavior = 'auto';
        isInDecelerationZone.current = false;
      }, 2000);
    }

    lastScrollTime.current = currentTime;
    lastScrollPosition.current = currentScroll;
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    const currentYear = visibleRange.start;
    const newEvent = TIMELINE_EVENTS.reduce((closest, event) => {
      if (event.year <= currentYear) {
        return (!closest || event.year > closest.year) ? event : closest;
      }
      return closest;
    }, null as TimelineEvent | null);

    if (newEvent) {
      if (activeCards.length === 0 || newEvent.year !== activeCards[activeCards.length - 1].year) {
        if (activeCards.length === 0) {
          setActiveCards([newEvent]);
        } else {
          setActiveCards(prev => [...prev, newEvent]);
        }
      }
    }
  }, [visibleRange.start, activeCards]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {showScrollHint && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white text-sm px-4 py-2 rounded shadow-lg z-50">
          Scroll sideways to explore the timeline →<br />
          <span className="text-gray-300 text-xs">(or hold Shift and scroll)</span>
        </div>
      )}

      <div className="flex-none bg-white border-b border-gray-200 pb-0">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 px-2 py-1">
          {['processed', 'seedOils', 'grains', 'nuts', 'fruits', 'vegetables', 'animal'].map((category) => (
            <div key={category} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getDietColor(category) }} />
              <span className="text-xs font-medium whitespace-nowrap">{formatCategory(category)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative h-[45vh] overflow-hidden mt-[-1px]">
        <div ref={scrollContainerRef} className="h-full overflow-x-auto overflow-y-hidden timeline-scroll" style={{ scrollBehavior: 'auto' }}>
          <div className="h-full" style={{ width: '302025px' }}>
            <DietVisualization />
          </div>
        </div>

        <div className="absolute bottom-2 left-0 right-0 px-4">
          <div className="flex justify-between text-sm">
            <div className="bg-black bg-opacity-80 text-white px-2 py-1 rounded">
              {Math.max(-300000, visibleRange.start)} BCE
            </div>
            <div className="bg-black bg-opacity-80 text-white px-2 py-1 rounded">
              {visibleRange.start + Math.floor(window.innerWidth / 2)}
              {visibleRange.start + Math.floor(window.innerWidth / 2) > 0 ? ' CE' : ' BCE'}
            </div>
            <div className="bg-black bg-opacity-80 text-white px-2 py-1 rounded">
              {Math.min(2025, visibleRange.start + window.innerWidth)}
              {visibleRange.start + window.innerWidth > 0 ? ' CE' : ' BCE'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="p-4">
          <div className="relative max-w-sm md:max-w-md mx-auto" style={{ height: '200px' }}>
            {activeCards.map((card, index) => (
              <div
                key={card.year}
                className={`absolute w-full bg-black bg-opacity-80 text-white p-4 rounded-lg shadow-lg transform transition-all duration-500 ${index === activeCards.length - 1 ? 'card-enter border-2 border-white/30' : ''}`}
                style={{
                  transform: `translateY(${(activeCards.length - index - 1) * 4}px) translateX(${(activeCards.length - index - 1) * 4}px)`,
                  zIndex: index,
                  backgroundColor: `rgba(0, 0, 0, ${0.8 - (activeCards.length - index - 1) * 0.1})`
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

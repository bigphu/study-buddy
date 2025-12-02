import React, { useState, useEffect, useRef } from 'react';
import { 
  format, startOfWeek, addDays, isSameDay, parseISO, 
  getHours, getMinutes, differenceInMinutes 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Loader } from 'lucide-react';
import Button from './Button'; 

const Calendar = ({ 
  sessions = [], 
  isLoading = false,
  searchQuery = '' 
}) => {
  // Initialize to the date of the data (Dec 2025) for demo purposes
  const [currentDate, setCurrentDate] = useState(new Date('2025-12-01T00:00:00'));
  const scrollContainerRef = useRef(null);

  // --- GRID CONFIGURATION ---
  const HOURS_IN_DAY = 24; 
  const SLOTS_PER_HOUR = 4; // 15-minute intervals
  const TOTAL_SLOTS = HOURS_IN_DAY * SLOTS_PER_HOUR;
  
  // Dimensions
  const ROW_HEIGHT_PX = 20; 
  const HEADER_HEIGHT_PX = 50;

  // Date Helpers
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
  const timeLabels = Array.from({ length: HOURS_IN_DAY }).map((_, i) => i);

  // --- AUTO SCROLL EFFECT ---
  // Scrolls the calendar to the earliest event of the week automatically
  useEffect(() => {
    if (sessions.length === 0 || !scrollContainerRef.current || isLoading) return;

    let earliestSlotIndex = TOTAL_SLOTS; 

    sessions.forEach(session => {
        if (!session.start_time) return;

        const s = parseISO(session.start_time);
        const isVisible = weekDays.some(day => isSameDay(day, s));

        if (isVisible) {
            const slotIndex = (getHours(s) * SLOTS_PER_HOUR) + Math.floor(getMinutes(s) / 15);
            if (slotIndex < earliestSlotIndex) {
                earliestSlotIndex = slotIndex;
            }
        }
    });

    if (earliestSlotIndex < TOTAL_SLOTS) {
        const targetPixel = HEADER_HEIGHT_PX + (earliestSlotIndex * ROW_HEIGHT_PX);
        const bufferPixels = ROW_HEIGHT_PX * 4; 
        
        scrollContainerRef.current.scrollTo({
          top: Math.max(0, targetPixel - bufferPixels),
          behavior: 'smooth'
        });
    }
  }, [sessions, currentDate, isLoading]);


  // --- CORE HELPER: Calculate Grid Position ---
  const getGridPosition = (start, end, dayDate) => {
    if (!start || !end) return null;
    
    const s = parseISO(start);
    const e = parseISO(end);

    const dayIndex = weekDays.findIndex(d => isSameDay(d, dayDate));
    if (dayIndex === -1) return null; 
    
    const colStart = dayIndex + 2; 

    // Calculate row start based on time
    const startRow = (getHours(s) * SLOTS_PER_HOUR) + Math.floor(getMinutes(s) / 15) + 2; 
    const durationMinutes = differenceInMinutes(e, s);
    const span = Math.ceil(durationMinutes / 15);

    return {
      gridColumn: colStart,
      gridRow: `${startRow} / span ${span}`,
    };
  };

  const getColorClasses = (id) => {
    const safeId = id || 0;
    const colors = [
      'bg-emerald-100/90 border-l-4 border-emerald-500 text-emerald-900',
      'bg-purple-100/90 border-l-4 border-purple-500 text-purple-900',
      'bg-blue-100/90 border-l-4 border-blue-500 text-blue-900',
      'bg-orange-100/90 border-l-4 border-orange-500 text-orange-900',
      'bg-rose-100/90 border-l-4 border-rose-500 text-rose-900',
    ];
    return colors[safeId % colors.length];
  };

  const filteredSessions = sessions.filter(s => 
    s.title ? s.title.toLowerCase().includes(searchQuery.toLowerCase()) : false
  );

  return (
    <div className="w-full h-full font-roboto text-txt-dark bg-surface flex flex-col">
      
      {/* --- Header Controls --- */}
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold font-outfit text-primary flex items-center gap-2">
            Schedule
            {isLoading && <Loader className="w-5 h-5 animate-spin text-txt-placeholder" />}
          </h2>
          <p className="text-txt-placeholder text-sm">
            {format(startDate, 'MMMM d')} - {format(addDays(startDate, 6), 'MMMM d, yyyy')}
          </p>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setCurrentDate(addDays(currentDate, -7))}
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => setCurrentDate(new Date('2025-12-01'))}
            >
              Today
            </Button>
            
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setCurrentDate(addDays(currentDate, 7))}
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
      </div>

      {/* --- THE SCROLLABLE GRID CONTAINER --- */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 max-h-[65vh] overflow-y-auto overflow-x-auto border border-border/30 rounded-xl bg-surface relative scroll-smooth shadow-inner"
      >
        
        <div 
            className="grid"
            style={{ 
                gridTemplateColumns: `70px repeat(7, minmax(140px, 1fr))`,
                gridTemplateRows: `${HEADER_HEIGHT_PX}px repeat(${TOTAL_SLOTS}, ${ROW_HEIGHT_PX}px)` 
            }}
        >

          {/* --- A. HEADER ROW (Sticky Top) --- */}
          <div className="sticky top-0 left-0 z-40 bg-surface border-b border-r border-border/20 flex items-center justify-center text-xs font-bold text-txt-placeholder uppercase tracking-wider">
            GMT+7
          </div>

          {weekDays.map((day, i) => (
            <div key={i} className={`sticky top-0 z-30 border-b border-border/20 p-2 text-center bg-surface/95 backdrop-blur flex flex-col justify-center ${i < 6 ? 'border-r' : ''}`}>
              <div className={`text-sm font-outfit font-bold ${isSameDay(day, new Date()) ? 'text-secondary-accent' : 'text-txt-primary'}`}>{format(day, 'EEE')}</div>
              <div className={`text-xs ${isSameDay(day, new Date()) ? 'text-secondary-accent font-bold' : 'text-txt-placeholder'}`}>{format(day, 'd')}</div>
            </div>
          ))}

          {/* --- B. GRID BODY --- */}
          {timeLabels.map((hour) => {
            const rowStart = 2 + (hour * SLOTS_PER_HOUR);
            
            return (
              <React.Fragment key={hour}>
                {/* Time Label */}
                <div 
                  className="sticky left-0 z-20 bg-surface border-r border-b border-border/10 text-xs text-txt-placeholder font-medium flex justify-center pt-1"
                  style={{ 
                    gridColumn: 1, 
                    gridRow: `${rowStart} / span ${SLOTS_PER_HOUR}` 
                  }}
                >
                  {hour}:00
                </div>

                {/* Empty Grid Cells */}
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <div 
                    key={`${hour}-${dayIndex}`}
                    className={`border-b border-border/10 ${dayIndex < 6 ? 'border-r' : ''}`}
                    style={{ 
                      gridColumn: dayIndex + 2, 
                      gridRow: `${rowStart} / span ${SLOTS_PER_HOUR}` 
                    }}
                  />
                ))}
              </React.Fragment>
            );
          })}

          {/* --- C. EVENTS (Overlay) --- */}
          {!isLoading && filteredSessions.map((session) => {
            const style = getGridPosition(session.start_time, session.end_time, parseISO(session.start_time));
            if (!style) return null;

            return (
              <div
                key={session.id}
                style={style}
                className={`
                  p-2 rounded-md text-xs shadow-sm cursor-pointer 
                  hover:shadow-xl hover:-translate-y-2 transition-all 
                  flex flex-col justify-start
                  whitespace-normal wrap-break-word overflow-hidden leading-tight
                  ${getColorClasses(session.course_id)}
                `}
                title={`${session.title} (${format(parseISO(session.start_time), 'HH:mm')} - ${format(parseISO(session.end_time), 'HH:mm')})`}
              >
                <div className="font-bold text-[13px] font-outfit">{session.title}</div>
                <div className="opacity-80 text-[11px] font-roboto mt-1 flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3" />
                  {format(parseISO(session.start_time), 'HH:mm')} - {format(parseISO(session.end_time), 'HH:mm')}
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
};

export default Calendar;
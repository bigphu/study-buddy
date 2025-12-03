import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  format, startOfWeek, addDays, isSameDay, parseISO, 
  getHours, getMinutes, differenceInMinutes, endOfDay, startOfDay, 
  addHours,
  subHours
} from 'date-fns';
import { 
  ChevronLeft, ChevronRight, Clock, Loader, CalendarIcon,
  CircleChevronDown, CircleChevronUp 
} from 'lucide-react';
import Button from './Button.jsx'; 
import Loading from './Loading.jsx';

const Calendar = ({ 
  sessions = [], 
  isLoading = false,
  searchQuery = '' 
}) => {
  // Initialize to the date of the data (Dec 2025)
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

  // --- 1. DEDUPLICATE SESSIONS ---
  const uniqueSessions = useMemo(() => {
    const seen = new Set();
    return sessions.filter(session => {
      const signature = session.id; 
      if (seen.has(signature)) return false;
      seen.add(signature);
      return true;
    });
  }, [sessions]);

  // --- 2. FILTER SEARCH ---
  const filteredSessions = uniqueSessions.filter(s => 
    s.title ? s.title.toLowerCase().includes(searchQuery.toLowerCase()) : false
  );

  // --- 3. SPLIT MULTI-DAY EVENTS ---
  const processedEvents = useMemo(() => {
    const events = [];

    filteredSessions.forEach(session => {
      if (!session.start_time || !session.end_time) return;

      const start = parseISO(session.start_time);
      const end = parseISO(session.end_time);

      if (isSameDay(start, end)) {
        events.push({ ...session, type: 'single' });
      } else {
        // Part 1: Start Time -> End of Day 1
        events.push({
          ...session,
          id: `${session.id}-part1`,
          originalId: session.id || session.course_id,
          start_time: session.start_time,
          end_time: addHours(session.start_time, 1).toISOString(),
          type: 'split-start',
          originalEnd: session.end_time
        });

        // Part 2: Start of Day 2 -> End Time
        events.push({
          ...session,
          id: `${session.id}-part2`,
          originalId: session.id || session.course_id,
          start_time: subHours(session.end_time, 1).toISOString(),
          end_time: session.end_time,
          type: 'split-end',
          originalStart: session.start_time
        });
      }
    });

    return events;
  }, [filteredSessions]);

  // --- AUTO SCROLL EFFECT ---
  useEffect(() => {
    if (processedEvents.length === 0 || !scrollContainerRef.current || isLoading) return;

    let earliestSlotIndex = TOTAL_SLOTS; 

    processedEvents.forEach(session => {
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
  }, [processedEvents, currentDate, isLoading]);

  // --- CORE HELPER: Calculate Grid Position ---
  const getGridPosition = (start, end, dayDate) => {
    if (!start || !end) return null;
    
    const s = parseISO(start);
    const e = parseISO(end);

    const dayIndex = weekDays.findIndex(d => isSameDay(d, dayDate));
    if (dayIndex === -1) return null; 
    
    const colStart = dayIndex + 2; 
    const startRow = (getHours(s) * SLOTS_PER_HOUR) + Math.floor(getMinutes(s) / 15) + 2; 
    
    let durationMinutes = differenceInMinutes(e, s);
    const span = Math.ceil(durationMinutes / 15);

    return {
      gridColumn: colStart,
      gridRow: `${startRow} / span ${span}`,
    };
  };

  // --- NEW: COLOR MATCHING LOGIC (Based on Session Variant) ---
  const getVariantStyle = (session) => {
    // These Palettes match CardItem.jsx variants
    // Structure: bg (light), text (dark), border (accent)
    const palettes = {
      'session-quiz':   'bg-rose-100/90 text-rose-800 border-rose-500', 
      'session-form':   'bg-amber-100/90 text-amber-800 border-amber-500', 
      'session-pdf':    'bg-emerald-100/90 text-emerald-800 border-emerald-500',
      'session-link':   'bg-blue-100/90 text-blue-800 border-blue-500',
      'user':           'bg-indigo-100/90 text-indigo-800 border-indigo-500',
      'course':         'bg-green-100/90 text-green-800 border-green-500', 
    };

    // 1. Direct Match from Variant
    if (session.variant && palettes[session.variant]) {
      return palettes[session.variant];
    }

    // 2. Fallback: Deterministic Hash based on ID
    const idToHash = session.course_id || session.originalId || session.id || 0;
    const numId = typeof idToHash === 'string' 
      ? idToHash.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      : idToHash;
    
    const fallbackKeys = ['session-link', 'user', 'course', 'session-pdf'];
    const key = fallbackKeys[Math.abs(numId) % fallbackKeys.length];

    return palettes[key];
  };

  return (
    <div className="w-full h-full font-roboto text-txt-dark bg-surface flex flex-col">
      
      {/* --- Header Controls --- */}
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold font-outfit text-primary-accent flex items-center gap-2">
            <CalendarIcon size={24}></CalendarIcon>
            Calendar Widget
            {isLoading && <Loading></Loading>}
          </h2>
          <p className="text-txt-placeholder text-sm">
            {format(startDate, 'MMMM d')} - {format(addDays(startDate, 6), 'MMMM d, yyyy')}
          </p>
        </div>
        
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

          {/* --- A. HEADER ROW --- */}
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
                <div 
                  className="sticky left-0 z-20 bg-surface border-r border-b border-border/10 text-xs text-txt-placeholder font-medium flex justify-center pt-1"
                  style={{ 
                    gridColumn: 1, 
                    gridRow: `${rowStart} / span ${SLOTS_PER_HOUR}` 
                  }}
                >
                  {hour}:00
                </div>

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
          {!isLoading && processedEvents.map((session) => {
            const currentId = session.id;
            
            const style = getGridPosition(
              session.start_time, 
              session.end_time, 
              parseISO(session.start_time)
            );
            
            if (!style) return null;

            // Get Colors matching CardItem variant
            const colorClasses = getVariantStyle(session);

            return (
              <div
                key={currentId}
                style={style}
                className={`
                  p-2 text-xs shadow-sm cursor-pointer relative
                  hover:shadow-xl hover:-translate-y-1 transition-all 
                  flex flex-col justify-start border-l-4
                  whitespace-normal wrap-break-word overflow-hidden leading-tight
                  ${colorClasses}
                  ${session.type === 'single' ? 'rounded-md' : ''}
                  ${session.type === 'split-start' ? 'rounded-t-md rounded-b-none border-b-0 opacity-90' : ''}
                  ${session.type === 'split-end' ? 'rounded-b-md rounded-t-none border-t-0 opacity-90' : ''}
                `}
                title={`${session.title}`}
              >
                {/* --- VISUAL INDICATOR: SPLIT START --- */}
                {session.type === 'split-start' && (
                  <div className="absolute bottom-0 left-0 w-full flex items-center px-2 pb-0.5">
                    <div className="h-px bg-current flex-1 opacity-50"></div>
                    <CircleChevronDown size={14} className="mx-1 shrink-0" />
                    <div className="h-px bg-current flex-1 opacity-50"></div>
                  </div>
                )}

                {/* --- VISUAL INDICATOR: SPLIT END --- */}
                {session.type === 'split-end' && (
                  <div className="absolute top-0 left-0 w-full flex items-center px-2 pt-0.5">
                    <div className="h-px bg-current flex-1 opacity-50"></div>
                    <CircleChevronUp size={14} className="mx-1 shrink-0" />
                    <div className="h-px bg-current flex-1 opacity-50"></div>
                  </div>
                )}

                {/* Content Container */}
                <div className={`flex flex-col h-full ${session.type === 'split-end' ? 'pt-3' : ''}`}>
                  <div className="font-bold text-[13px] font-outfit flex items-center gap-1">
                    {session.title}
                  </div>
                  
                  <div className="text-[11px] font-roboto mt-1 flex items-center gap-1 shrink-0 opacity-90">
                    <Clock className="w-3 h-3" />
                    
                    {session.type === 'single' && (
                      <span>
                        {format(parseISO(session.start_time), 'HH:mm')} - {format(parseISO(session.end_time), 'HH:mm')}
                      </span>
                    )}
                    {session.type === 'split-start' && (
                      <span>
                        {format(parseISO(session.start_time), 'HH:mm')} - Cont.
                      </span>
                    )}
                    {session.type === 'split-end' && (
                      <span>
                        Cont. - {format(parseISO(session.end_time), 'HH:mm')}
                      </span>
                    )}
                  </div>
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
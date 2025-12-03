import React from 'react';
import { 
  User, Hash, ArrowRight, Activity, Clock4, CircleX, HelpCircle, 
  Calendar, Video, ExternalLink, CheckCircle2 
} from 'lucide-react';
import { format, isWithinInterval, isPast, isFuture, parseISO } from 'date-fns'; // Optional: handy for date logic, or use standard JS Date

import Button from './Button.jsx';

const CardItem = ({
  variant = 'course', // 'course' | 'session'
  
  // Shared Props
  itemId,
  title,
  tutorName,
  
  // Course Specific Props
  description,
  status: manualStatus, // For courses (Open, etc.)
  
  // Session Specific Props
  startTime,
  endTime,
  link,
  
  onAction
}) => {

  // --- LOGIC: Session Status Calculation ---
  const getSessionStatus = () => {
    if (!startTime || !endTime) return 'Unknown';
    
    // Convert SQL datetime string to JS Date objects
    // Note: Ensure your API returns ISO format or standard strings
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (now < start) return 'Upcoming';
    if (now >= start && now <= end) return 'Live';
    return 'Finished';
  };

  // Determine effective status based on variant
  const displayStatus = variant === 'session' ? getSessionStatus() : manualStatus;

  // --- LOGIC: Visual Configuration ---
  const getStatusConfig = (currentStatus) => {
    switch (currentStatus) {
      // -- LIVE / ONGOING / OPEN --
      case 'Ongoing': // Course
      case 'Open':    // Course
      case 'Live':    // Session
        return {
          cardBorder: 'border border-green-200', 
          badgeClasses: 'bg-green-100 text-green-700 border-green-200',
          headerClasses: 'bg-green-50 text-green-600',
          titleHoverClass: 'group-hover:text-green-600',
          Icon: variant === 'session' ? Video : Activity,
          iconSpin: currentStatus === 'Live' // Pulse effect for Live sessions
        };

      // -- PROCESSING / UPCOMING --
      case 'Processing': // Course
      case 'Upcoming':   // Session
        return {
          cardBorder: 'border border-yellow-200', 
          badgeClasses: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          headerClasses: 'bg-yellow-50 text-yellow-600',
          titleHoverClass: 'group-hover:text-yellow-600',
          Icon: variant === 'session' ? Calendar : Clock4,
        };

      // -- ENDED / FINISHED --
      case 'Ended':    // Course
      case 'Finished': // Session
        return {
          cardBorder: 'border border-red-200', 
          badgeClasses: 'bg-red-100 text-red-600 border-red-200',
          headerClasses: 'bg-red-50 text-red-500',
          titleHoverClass: 'group-hover:text-red-600',
          Icon: variant === 'session' ? CheckCircle2 : CircleX,
        };

      default:
        return {
          cardBorder: 'border border-gray-200', 
          badgeClasses: 'bg-gray-100 text-gray-700 border-gray-200',
          headerClasses: 'bg-gray-50 text-gray-500',
          titleHoverClass: 'group-hover:text-gray-600',
          Icon: HelpCircle
        };
    }
  };

  const { 
    cardBorder, badgeClasses, headerClasses, titleHoverClass, Icon, iconSpin 
  } = getStatusConfig(displayStatus);

  // --- RENDER HELPERS ---
  
  // Format Date Range for Sessions
  const renderSessionTime = () => {
    if (!startTime || !endTime) return "Time TBD";
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const dateStr = start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    const timeStr = `${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    
    return `${dateStr} • ${timeStr}`;
  };

  return (
    <div className={`group w-[270px] bg-white rounded-3xl ${cardBorder} shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col h-full`}>
      
      {/* Header Section */}
      <div className={`${headerClasses} p-5 relative h-28 flex justify-between items-start transition-colors duration-300`}>
        <div className="bg-white/80 backdrop-blur-sm p-2.5 rounded-2xl shadow-sm inline-flex items-center justify-center">
          <Icon size={24} className={iconSpin ? 'animate-pulse' : ''} />
        </div>
        <div className={`text-xs font-bold px-3 py-1.5 rounded-full border font-outfit ${badgeClasses} shadow-sm uppercase tracking-wide`}>
          {displayStatus}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-6 flex flex-col gap-4 grow bg-white relative z-10">
        
        {/* Title Area */}
        <div>
          <h3 className={`text-lg h-12 line-clamp-2 font-bold font-outfit text-txt-dark leading-tight mb-2 transition-colors duration-300 ${titleHoverClass}`}>
            {title}
          </h3>
          
          {/* Subtitle: Description (Course) OR Time (Session) */}
          <p className="text-txt-dark text-sm font-outfit font-medium h-6 leading-relaxed line-clamp-1 flex items-center gap-1">
            {variant === 'session' ? (
              <>
                <Clock4 size={16} className="text-txt-placeholder" />
                {renderSessionTime()}
              </>
            ) : (
              description
            )}
          </p>
        </div>

        {/* Metadata Row */}
        <div className="flex items-center justify-between gap-2 text-txt-dark text-sm font-outfit font-medium pt-3 border-t border-txt-placeholder/20">
          
          {/* Left Meta: Tutor Name (Shared) */}
          <div className="flex items-center gap-2">
            <User size={16} className="text-txt-placeholder" />
            <span className="truncate max-w-[100px]">{tutorName || 'TBA'}</span>
          </div>

          {/* Right Meta: itemId (Course) vs Link status (Session) */}
          <div className="flex items-center gap-2">
            {variant === 'course' ? (
              <>
                <Hash size={16} className="text-txt-placeholder" />
                <span>{itemId}</span>
              </>
            ) : (
              /* Visual indicator if link exists */
              link && <Video size={16} className={displayStatus === 'Live' ? "text-green-500" : "text-gray-300"} />
            )}
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => {
            // For sessions, if link exists, we might want to open it
            if (variant === 'session' && link) {
              window.open(link, '_blank');
            }
            if (onAction) onAction();
          }}
          variant={displayStatus === 'Live' ? 'primary' : 'third'} // Highlight button if session is Live
          className="w-full mt-auto"
        >
          <div className='flex justify-center items-center gap-2'>
            <span className="font-semibold text-sm">
              {variant === 'session' 
                ? (displayStatus === 'Live' ? 'Join Now' : 'Details') 
                : 'View Details'}
            </span>
            {variant === 'session' && displayStatus === 'Live' ? <ExternalLink size={16} /> : <ArrowRight size={16} />}
          </div>
        </Button>
      </div>
    </div>
  );
};

export default CardItem;
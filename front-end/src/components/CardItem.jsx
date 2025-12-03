import React from 'react';
import { 
  User, Hash, ArrowRight, Activity, Clock4, CircleX, HelpCircle, 
  Calendar, Video, Link as LinkIcon, ExternalLink, CheckCircle2, 
  FileText, ClipboardList, BrainCircuit, PlayCircle
} from 'lucide-react';

import Button from './Button.jsx';

const CardItem = ({
  // Variants: 'course' | 'user' | 'session-link' | 'session-pdf' | 'session-form' | 'session-quiz'
  variant = 'course', 
  
  // --- SHARED DATA PROPS ---
  itemId,         // Course ID
  title,          // Name
  description,    // Overview
  tutorName,      // Tutor Name
  avatarUrl,      // Avatar Image URL
  
  // --- VARIANT SPECIFIC PROPS ---
  academicStatus, // For 'user'
  status: manualStatus, // For 'course' (Open, Ongoing, etc)
  
  // For 'session-*' variants
  startTime,
  endTime,
  link,
  
  onAction
}) => {

  // Helper to identify if this is any type of session
  const isSession = variant.startsWith('session-');

  // --- LOGIC: Visual Configuration ---
  const getVariantConfig = () => {
    
    // 1. User Variant (Indigo)
    if (variant === 'user') {
      return {
        cardBorder: 'border border-indigo-200',
        badgeClasses: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        headerClasses: 'bg-indigo-50 text-indigo-600',
        titleHoverClass: 'group-hover:text-indigo-600',
        Icon: User,
        label: academicStatus || 'Member',
        btnText: 'View Details',
        btnIcon: ArrowRight
      };
    }

    // 2. Session Sub-Variants
    if (isSession) {
      switch (variant) {
        case 'session-pdf':
          return {
            cardBorder: 'border border-emerald-200',
            badgeClasses: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            headerClasses: 'bg-emerald-50 text-emerald-600',
            titleHoverClass: 'group-hover:text-emerald-600',
            Icon: FileText,
            label: 'Material',
            btnText: 'View PDF',
            btnIcon: ExternalLink
          };
          case 'session-form':
            return {
              cardBorder: 'border border-amber-200',
              badgeClasses: 'bg-amber-100 text-amber-700 border-amber-200',
              headerClasses: 'bg-amber-50 text-amber-600',
              titleHoverClass: 'group-hover:text-amber-600',
              Icon: ClipboardList,
              label: 'Survey', // or Form
              btnText: 'Fill Form',
              btnIcon: ExternalLink
            };
          case 'session-quiz':
            return {
              cardBorder: 'border border-rose-200',
              badgeClasses: 'bg-rose-100 text-rose-700 border-rose-200',
              headerClasses: 'bg-rose-50 text-rose-600',
              titleHoverClass: 'group-hover:text-rose-600',
              Icon: BrainCircuit,
              label: 'Quiz',
              btnText: 'Take Quiz',
              btnIcon: PlayCircle
          };
        case 'session-link':
        default: 
          // Default session fallback (Meeting/Link)
          return {
            cardBorder: 'border border-blue-200',
            badgeClasses: 'bg-blue-100 text-blue-700 border-blue-200',
            headerClasses: 'bg-blue-50 text-blue-600',
            titleHoverClass: 'group-hover:text-blue-600',
            Icon: Video,
            label: 'Meeting',
            btnText: 'Join Link',
            btnIcon: ExternalLink
          };
      }
    }

    // 3. Course Variant (Green/Yellow/Red based on manualStatus)
    // Default fallback is 'course'
    switch (manualStatus) {
      case 'Ongoing': case 'Open': case 'Live':
        return {
          cardBorder: 'border border-green-200', 
          badgeClasses: 'bg-green-100 text-green-700 border-green-200',
          headerClasses: 'bg-green-50 text-green-600',
          titleHoverClass: 'group-hover:text-green-600',
          Icon: Activity,
          label: manualStatus,
          btnText: 'View Details',
          btnIcon: ArrowRight
        };
      case 'Processing': case 'Upcoming':
        return {
          cardBorder: 'border border-yellow-200', 
          badgeClasses: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          headerClasses: 'bg-yellow-50 text-yellow-600',
          titleHoverClass: 'group-hover:text-yellow-600',
          Icon: Clock4,
          label: manualStatus,
          btnText: 'View Details',
          btnIcon: ArrowRight
        };
      case 'Ended': case 'Finished':
        return {
          cardBorder: 'border border-red-200', 
          badgeClasses: 'bg-red-100 text-red-600 border-red-200',
          headerClasses: 'bg-red-50 text-red-500',
          titleHoverClass: 'group-hover:text-red-600',
          Icon: CircleX,
          label: manualStatus,
          btnText: 'View Details',
          btnIcon: ArrowRight
        };
      default:
        return {
          cardBorder: 'border border-gray-200', 
          badgeClasses: 'bg-gray-100 text-gray-700 border-gray-200',
          headerClasses: 'bg-gray-50 text-gray-500',
          titleHoverClass: 'group-hover:text-gray-600',
          Icon: HelpCircle,
          label: manualStatus || 'Course',
          btnText: 'View Details',
          btnIcon: ArrowRight
        };
    }
  };

  const { 
    cardBorder, badgeClasses, headerClasses, titleHoverClass, 
    Icon, label, btnText, btnIcon: BtnIcon 
  } = getVariantConfig();

  // --- RENDER HELPER: Date Logic ---
  const renderSessionTime = () => {
    if (!startTime || !endTime) return "Time TBD";
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // Check if on same day
    const isSameDay = start.toDateString() === end.toDateString();

    const dateOptions = { day: '2-digit', month: 'short' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };

    if (isSameDay) {
      // Format: 12 Oct • 14:00 - 16:00
      return (
        <>
          {start.toLocaleDateString('en-GB', dateOptions)} 
          <span className="mx-1.5 opacity-50">•</span> 
          {start.toLocaleTimeString([], timeOptions)} - {end.toLocaleTimeString([], timeOptions)}
        </>
      );
    } else {
      // Format: 12 Oct, 14:00 - 13 Oct, 10:00
      return (
        <span className="text-xs">
          {start.toLocaleDateString('en-GB', dateOptions)}, {start.toLocaleTimeString([], timeOptions)} 
          <span className="mx-1">→</span>
          {end.toLocaleDateString('en-GB', dateOptions)}, {end.toLocaleTimeString([], timeOptions)}
        </span>
      );
    }
  };

  // --- CONTENT MAPPING ---
  let displayTitle = title;          
  let displaySubtitle = description; 
  let SubIcon = null;                
  let subtitleTextColor = "text-txt-placeholder"; 

  if (isSession) {
    displaySubtitle = renderSessionTime();
    SubIcon = Clock4;
    subtitleTextColor = "text-txt-dark"; 
  }

  return (
    <div className={`group w-full bg-white rounded-3xl ${cardBorder} shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col h-full`}>
      
      {/* --- HEADER --- */}
      <div className={`${headerClasses} p-5 relative h-20 flex justify-between items-start transition-colors duration-300`}>
        
        {/* Avatar OR Variant Icon */}
        <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm inline-flex items-center justify-center overflow-hidden 
          ${avatarUrl ? 'p-0 w-11 h-11' : 'p-2.5'}`}>
          
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          ) : (
            // If session, show specific variant icon (PDF/Form/etc). If user/course, show User icon.
            isSession ? <Icon size={24} /> : <User size={24} />
          )}
        </div>

        {/* Status Badge */}
        <div className={`text-xs font-bold px-3 py-1.5 rounded-full border font-outfit ${badgeClasses} shadow-sm uppercase tracking-wide max-w-[140px] truncate`}>
          {label}
        </div>
      </div>

      {/* --- BODY --- */}
      <div className="p-6 flex flex-col gap-4 grow bg-white relative z-10">
        
        {/* Title & Description */}
        <div className="flex flex-col gap-2">
          
          <h3 className={`text-lg font-bold font-outfit text-txt-dark leading-tight transition-colors duration-300 line-clamp-2 ${titleHoverClass}`}>
            {displayTitle}
          </h3>
          
          {/* Subtitle (Description or Time) */}
          <div className={`${subtitleTextColor} text-sm font-outfit font-medium leading-relaxed flex items-start gap-1.5`}>
            {SubIcon && <SubIcon size={16} className="shrink-0 mt-1 text-txt-placeholder" />}
            <span className="line-clamp-2 wrap-break-word">
              {displaySubtitle || "No description available."}
            </span>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-start justify-between gap-y-2 gap-x-2 text-txt-dark text-sm font-outfit font-medium pt-3 border-t border-txt-placeholder/20 mt-auto">
          
          {/* Left: Tutor Name */}
          <div className="flex items-start gap-2 max-w-full">
            <User size={16} className="shrink-0 mt-0.5 text-txt-placeholder" />
            <span className="line-clamp-2 wrap-break-word capitalize">{tutorName || 'TBA'}</span>
          </div>

          {/* Right: ID or Link Icon */}
          <div className="flex items-start gap-2 max-w-full">
            {isSession ? (
              link && <LinkIcon size={16} className="shrink-0 mt-0.5 text-txt-accent" />
            ) : (
              <>
                <Hash size={16} className="shrink-0 mt-0.5 text-txt-placeholder" />
                <span className="line-clamp-2 wrap-break-word text-right">{itemId}</span>
              </>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => {
            if (isSession && link) window.open(link, '_blank');
            if (onAction) onAction();
          }}
          variant='third' // Default styling, can be customized if needed
          className="w-full mt-2"
        >
          <div className='flex justify-center items-center gap-2'>
            <span className="font-semibold text-sm">{btnText}</span>
            <BtnIcon size={16} />
          </div>
        </Button>
      </div>
    </div>
  );
};

export default CardItem;
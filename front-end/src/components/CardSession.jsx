import React from 'react';
import { Video, ExternalLink, FileText, ClipboardList, BrainCircuit, PlayCircle } from 'lucide-react';
import CardBase from './CardBase.jsx';

const CardSession = ({ itemId, title, memberName, startTime, endTime, link, variant }) => {
  
  // --- LOGIC: Time Formatting ---
  const renderSessionTime = () => {
    if (!startTime || !endTime) return "Time TBD";
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // Check if on same day
    const isSameDay = start.toDateString() === end.toDateString();

    const dateOptions = { day: '2-digit', month: 'short' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };

    // Corrected Logic
    if (isSameDay) {
      return (
        <>
          {start.toLocaleDateString('en-GB', dateOptions)} 
          <span className="mx-1.5">•</span> 
          {start.toLocaleTimeString([], timeOptions)} - {end.toLocaleTimeString([], timeOptions)}
        </>
      );
    } else {
      return (
        <>
          {start.toLocaleDateString('en-GB', dateOptions)} 
          <span className="mx-1">•</span>
          {start.toLocaleTimeString([], timeOptions)} 
          <span className="mx-1">→</span>
          {end.toLocaleDateString('en-GB', dateOptions)} 
          <span className="mx-1">•</span>
          {end.toLocaleTimeString([], timeOptions)}
        </>
      );
    }
  };

  const handleJoin = () => {
    if (link) window.open(link, '_blank');
  };

  // --- LOGIC: Variant Configuration ---
  const getSessionConfig = (variantType) => {
    switch (variantType) {
      case 'session-pdf':
        return {
          colors: {
            border: 'border border-emerald-200',
            bgBadge: 'bg-emerald-100', textBadge: 'text-emerald-700', borderBadge: 'border-emerald-200',
            bgHeader: 'bg-emerald-50', textHeader: 'text-emerald-600', textHover: 'group-hover:text-emerald-600',
          },
          Icon: FileText,
          label: 'Material',
          btnText: 'View PDF',
          btnIcon: ExternalLink
        };

      case 'session-form':
        return {
          colors: {
            border: 'border border-amber-200',
            bgBadge: 'bg-amber-100', textBadge: 'text-amber-700', borderBadge: 'border-amber-200',
            bgHeader: 'bg-amber-50', textHeader: 'text-amber-600', textHover: 'group-hover:text-amber-600',
          },
          Icon: ClipboardList,
          label: 'Survey',
          btnText: 'Fill Form',
          btnIcon: ExternalLink
        };

      case 'session-quiz':
        return {
          colors: {
            border: 'border border-rose-200',
            bgBadge: 'bg-rose-100', textBadge: 'text-rose-700', borderBadge: 'border-rose-200',
            bgHeader: 'bg-rose-50', textHeader: 'text-rose-600', textHover: 'group-hover:text-rose-600',
          },
          Icon: BrainCircuit,
          label: 'Quiz',
          btnText: 'Take Quiz',
          btnIcon: PlayCircle
        };

      case 'session-link':
      default:
        return {
          colors: {
            border: 'border border-blue-200',
            bgBadge: 'bg-blue-100', textBadge: 'text-blue-700', borderBadge: 'border-blue-200',
            bgHeader: 'bg-blue-50', textHeader: 'text-blue-600', textHover: 'group-hover:text-blue-600',
          },
          Icon: Video,
          label: 'Meeting',
          btnText: 'Join Link',
          btnIcon: ExternalLink
        };
    }
  };

  const { colors, Icon, label, btnText, btnIcon: BtnIcon } = getSessionConfig(variant);

  return (
    <CardBase
      colors={colors}
      Icon={Icon}
      itemId={itemId}
      title={title}
      subtitle={renderSessionTime()}
      memberName={memberName}
      badgeLabel={label}
      btnText={btnText}
      BtnIcon={BtnIcon}
      onAction={handleJoin}
    />
  );
};

export default CardSession;
import React from 'react';
import { User, Hash, Edit3 } from 'lucide-react';
import Button from './Button.jsx';

const CardBase = ({
  // Visual Styles
  colors,          // { border, bgBadge, textBadge, borderBadge, bgHeader, textHeader, textHover }
  Icon,            // The main icon to display if no avatar
  
  // Content
  itemId,
  title,
  subtitle,
  memberName,
  avatarUrl,
  badgeLabel,
  
  // Actions
  btnText,
  BtnIcon,
  onAction,
  onEdit,
}) => {
  return (
    <div className={`group w-full bg-white rounded-3xl ${colors.border} shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col h-full`}>
      
      {/* --- HEADER --- */}
      <div className={`${colors.bgHeader} ${colors.textHeader} p-5 relative h-20 flex justify-between items-start transition-colors duration-300`}>
        
        {/* Avatar OR Icon */}
        <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm inline-flex items-center justify-center overflow-hidden 
          ${avatarUrl ? 'p-0 w-11 h-11' : 'p-2.5'}`}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover"/>
          ) : (
            <Icon size={24} />
          )}
        </div>

        {/* TOP RIGHT: Status Badge AND Edit Button */}
        <div className="flex gap-2 items-center">
            {onEdit && (
                <div className="h-8 w-8">
                  <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-0 h-full w-full rounded-full bg-white/50 hover:bg-white backdrop-blur-sm border-0"
                      onClick={(e) => {
                          e.stopPropagation();
                          onEdit();
                      }}
                  >
                      <Edit3 size={16} />
                  </Button>
                </div>
            )}

            <div className={`text-xs font-bold px-3 py-1.5 rounded-full border font-outfit ${colors.bgBadge} ${colors.textBadge} ${colors.borderBadge} shadow-sm uppercase tracking-wide max-w-[140px] truncate`}>
                {badgeLabel}
            </div>
        </div>
      </div>

      {/* --- BODY --- */}
      <div className="p-6 flex flex-col gap-4 grow bg-white relative z-10">
        
        {/* Title & Description */}
        <div className="flex flex-col gap-2">
          <h3 className={`text-lg font-bold font-outfit text-txt-dark leading-tight transition-colors duration-300 line-clamp-2 ${colors.textHover}`}>
            {title}
          </h3>
          <div className={`text-txt-placeholder text-sm font-outfit font-medium leading-relaxed flex items-start gap-1.5`}>
            <span className="line-clamp-2 wrap-break-word">
              {subtitle || "No description available."}
            </span>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-start justify-between gap-y-2 gap-x-2 text-txt-dark text-sm font-outfit font-medium pt-3 border-t border-txt-placeholder/20 mt-auto">
          <div className="flex items-start gap-2 max-w-full">
            <User size={16} className="shrink-0 mt-0.5 text-txt-placeholder" />
            <span className="line-clamp-2 wrap-break-word capitalize">{memberName || 'System'}</span>
          </div>
          <div className="flex items-start gap-2 max-w-full">
            <Hash size={16} className="shrink-0 mt-0.5 text-txt-placeholder" />
            <span className="line-clamp-2 wrap-break-word text-right">{itemId}</span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={onAction}
          variant='third'
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

export default CardBase;
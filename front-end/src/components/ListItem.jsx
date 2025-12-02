import React from 'react';
import { User, Hash, ArrowRight, Activity, Clock4, CircleX, HelpCircle } from 'lucide-react';
import Button from './Button.jsx';

const ListItem = ({ 
  courseId, 
  tutorName, 
  title, 
  status, // "Ongoing", "Processing", "Ended"
  onViewDetails 
}) => {
  
  // Reuse logic from CardItem to determine colors/icons
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Ongoing':
        return {
          itemBorder: 'border-green-200 hover:border-green-300', 
          badgeClasses: 'bg-green-100 text-green-700 border-green-200',
          iconBg: 'bg-green-50',
          iconColor: 'text-green-600',
          Icon: Activity
        };
      case 'Processing':
        return {
          itemBorder: 'border-yellow-200 hover:border-yellow-300', 
          badgeClasses: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          iconBg: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
          Icon: Clock4,
        };
      case 'Ended':
        return {
          itemBorder: 'border-red-200 hover:border-red-300', 
          badgeClasses: 'bg-red-100 text-red-700 border-red-200',
          iconBg: 'bg-red-50',
          iconColor: 'text-red-600',
          Icon: CircleX
        };
      default:
        return {
          itemBorder: 'border-gray-200 hover:border-gray-300', 
          badgeClasses: 'bg-gray-100 text-gray-700 border-gray-200',
          iconBg: 'bg-gray-50',
          iconColor: 'text-gray-500',
          Icon: HelpCircle
        };
    }
  };

  const { 
    itemBorder, 
    badgeClasses, 
    iconBg, 
    iconColor, 
    Icon 
  } = getStatusConfig(status);

  return (
    <div className={`group flex w-full items-center justify-between bg-white border ${itemBorder} rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 mb-3`}>
      
      {/* Left: Icon & Main Info */}
      <div className="flex items-center gap-4 flex-1">
        
        {/* Status Icon Box */}
        <div className={`h-12 w-12 shrink-0 rounded-xl flex items-center justify-center ${iconBg} ${iconColor} transition-colors`}>
          <Icon size={24} />
        </div>

        {/* Text Info */}
        <div className="flex flex-col gap-1">
          <h3 className="text-md font-bold font-outfit text-txt-dark leading-tight group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          {/* Metadata Row */}
          <div className="flex items-center gap-4 text-xs font-medium text-txt-dark font-roboto">
            <div className="flex items-center gap-1.5">
              <User size={14} className="text-txt-placeholder" />
              <span>{tutorName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Hash size={14} className="text-txt-placeholder"/>
              <span>{courseId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Status Badge */}
      <div className="px-6 shrink-0 hidden sm:block">
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full border font-outfit uppercase tracking-wide ${badgeClasses}`}>
          {status}
        </span>
      </div>

      {/* Right: Action Arrow */}
      <div className="shrink-0 ml-2">
        <Button 
          onClick={onViewDetails} 
          variant="third" 
        >
          <ArrowRight size={20} />
        </Button>
      </div>

    </div>
  );
};

export default ListItem;
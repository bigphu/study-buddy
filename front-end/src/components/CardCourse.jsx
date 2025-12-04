import React from 'react';
import { Activity, Clock4, CircleX, HelpCircle, ArrowRight } from 'lucide-react';
import CardBase from './CardBase.jsx';

const CardCourse = ({ itemId, title, description, memberName, status, onAction, onEdit }) => {
  
  // Determine Visuals based on Status
  const getStatusConfig = (statusStr) => {
    switch (statusStr) {
      case 'Ongoing': case 'Open': case 'Live':
        return {
          colors: {
            border: 'border border-green-200',
            bgBadge: 'bg-green-100', textBadge: 'text-green-700', borderBadge: 'border-green-200',
            bgHeader: 'bg-green-50', textHeader: 'text-green-600', textHover: 'group-hover:text-green-600',
          },
          Icon: Activity
        };
      case 'Processing': case 'Upcoming':
        return {
          colors: {
            border: 'border border-yellow-200',
            bgBadge: 'bg-yellow-100', textBadge: 'text-yellow-700', borderBadge: 'border-yellow-200',
            bgHeader: 'bg-yellow-50', textHeader: 'text-yellow-600', textHover: 'group-hover:text-yellow-600',
          },
          Icon: Clock4
        };
      case 'Ended': case 'Finished':
        return {
          colors: {
            border: 'border border-red-200',
            bgBadge: 'bg-red-100', textBadge: 'text-red-600', borderBadge: 'border-red-200',
            bgHeader: 'bg-red-50', textHeader: 'text-red-500', textHover: 'group-hover:text-red-600',
          },
          Icon: CircleX
        };
      default:
        return {
          colors: {
            border: 'border border-gray-200',
            bgBadge: 'bg-gray-100', textBadge: 'text-gray-700', borderBadge: 'border-gray-200',
            bgHeader: 'bg-gray-50', textHeader: 'text-gray-500', textHover: 'group-hover:text-gray-600',
          },
          Icon: HelpCircle
        };
    }
  };

  const { colors, Icon } = getStatusConfig(status);

  return (
    <CardBase
      colors={colors}
      Icon={Icon}
      itemId={itemId}
      title={title}
      subtitle={description}
      memberName={memberName}
      badgeLabel={status || 'Course'}
      btnText="View Details"
      BtnIcon={ArrowRight}
      onAction={onAction}
      onEdit={onEdit}
    />
  );
};

export default CardCourse;
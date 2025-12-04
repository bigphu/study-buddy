import React from 'react';
import { User, ArrowRight } from 'lucide-react';
import CardBase from './CardBase.jsx';

const CardUser = ({ itemId, title, description, memberName, avatarUrl, academicStatus, onAction }) => {
  const colors = {
    border: 'border border-indigo-200',
    bgBadge: 'bg-indigo-100',
    textBadge: 'text-indigo-700',
    borderBadge: 'border-indigo-200',
    bgHeader: 'bg-indigo-50',
    textHeader: 'text-indigo-600',
    textHover: 'group-hover:text-indigo-600',
  };

  return (
    <CardBase
      colors={colors}
      Icon={User}
      itemId={itemId}
      title={title}
      subtitle={description}
      memberName={memberName}
      avatarUrl={avatarUrl}
      badgeLabel={academicStatus || 'Member'}
      btnText="View Profile"
      BtnIcon={ArrowRight}
      onAction={onAction}
      // User cards typically don't have an 'Edit' button
    />
  );
};

export default CardUser;
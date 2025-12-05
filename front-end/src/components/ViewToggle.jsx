import React from 'react';

const ViewToggle = ({ options, activeId, onToggle }) => {
  const containerClass = "flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm self-center";
  const buttonBaseClass = "flex items-center gap-2 px-6 py-2 rounded-lg font-outfit font-bold transition-all";
  const activeClass = "bg-primary-accent text-white shadow-sm";
  const inactiveClass = "text-txt-placeholder hover:bg-gray-50";

  return (
    <div className={containerClass}>
      {options.map((option) => {
        // Capitalize to use as a JSX component
        const Icon = option.icon;

        return (
          <button
            key={option.id}
            onClick={() => onToggle(option.id)}
            className={`${buttonBaseClass} ${
              activeId === option.id ? activeClass : inactiveClass
            }`}
          >
            {/* Only render Icon if it exists */}
            {Icon && <Icon size={18} />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default ViewToggle;
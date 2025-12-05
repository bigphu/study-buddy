import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const InputSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  icon: Icon,
  required = false,
  error = '',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    setIsOpen(false);
    // Mimic standard event for parent compatibility
    if (onChange) {
      onChange({
        target: {
          name: name,
          value: option
        }
      });
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`} ref={wrapperRef}>
      {label && (
        <label className="text-sm font-bold font-outfit text-txt-dark uppercase tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Main Display Box */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className={`
            group w-full flex items-center gap-3 py-3 px-4 rounded-xl 
            border transition-all duration-200 
            bg-primary-accent cursor-pointer relative
            ${error 
              ? 'border-red-500' 
              // : isOpen 
              //   ? 'border-txt-placeholder hover:border-txt-placeholder ring-2 ring-offset-2 ring-border' 
              //   : 'border-txt-dark hover:border-txt-placeholder'
                : 'text-txt-light bg-primary-accent border-primary-accent'
            }
          `}
        >
          {/* Icon */}
          {Icon && (
            <div className={`transition-colors duration-200 text-txt-light}`}>
              <Icon size={20} />
            </div>
          )}

          {/* Selected Value or Placeholder */}
          <div className="flex-1 flex items-center justify-between">
            <span className={`font-medium font-roboto text-base ${value ? 'text-txt-light bg-primary-accent ' : 'text-txt-placeholder'}`}>
              {value || placeholder}
            </span>
            <ChevronDown 
              size={20} 
              className={`text-txt-light transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            />
          </div>
        </div>

        {/* Dropdown Menu - SearchBar Style */}
        {isOpen && (
          <div className="absolute top-full mt-2 left-0 w-full bg-surface p-2 flex flex-col gap-2 shadow-sm shadow-secondary-accent rounded-lg z-20 overflow-hidden border border-gray-100">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className={`
                  w-full text-left px-4 py-2 text-sm font-medium font-outfit rounded-md transition-colors 
                  hover:bg-secondary-accent hover:text-txt-light
                  ${value === option 
                    ? 'text-txt-light bg-primary-accent' 
                    : 'text-txt-primary'
                  }
                `}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <span className="text-xs font-medium text-red-500 font-roboto ml-1">
          {error}
        </span>
      )}
    </div>
  );
};

export default InputSelect;
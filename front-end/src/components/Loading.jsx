import React from 'react';
import { LoaderIcon } from 'lucide-react';

const Loading = ({
  size = 'md',
  text,
  fullScreen = false,
  className = '',
  iconClassName = '',
}) => {
  // Map size presets to pixel values for Lucide
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 48,
    xl: 64,
  };

  // Base container classes
  const baseClasses = "flex items-center justify-center gap-3 text-txt-dark";
  
  // Full screen specific classes
  const fullScreenClasses = fullScreen 
    ? "fixed inset-0 z-60 bg-white/80 backdrop-blur-sm h-[125vh] w-full" 
    : "";

  return (
    <div className={`${baseClasses} ${fullScreenClasses} ${className}`}>
      <LoaderIcon 
        className={`animate-spin ${iconClassName}`} 
        size={sizeMap[size]} 
      />
      {text && (
        <p className="text-sm font-medium font-roboto animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default Loading;
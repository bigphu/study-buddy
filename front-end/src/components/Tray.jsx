import React from 'react'

const Tray = ({ 
  pos = '', 
  size = 'col-span-2', 
  dir = 'flex-col', 
  className = '', 
  variant = 'flex', 
  title, 
  children, 
  ...props 
}) => {
  
  // Define layout styles based on the variant
  let contentLayoutStyles = '';

  if (variant === 'grid') {
    // Standard Grid (Multi-row)
    contentLayoutStyles = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 justify-items-center w-full gap-4';
    
  } else if (variant === 'scroll') {
    // UPDATED: Grid-based Horizontal Scroll
    // 1. grid-flow-col: Forces items sideways
    // 2. auto-cols-max: Sets column width to the content size (can be changed to fixed px or %)
    contentLayoutStyles = 'grid grid-flow-col auto-cols-[23%] w-full overflow-x-scroll gap-6 pb-4'; 
    
  } else {
    // Standard Flex
    contentLayoutStyles = `flex ${dir} w-full`;
  }

  return (
    <div 
      className={`${pos} ${size} flex flex-col ${className}`} 
      {...props}
    >
      {/* The Visual Container */}
      <div className="flex flex-col items-start justify-start bg-surface py-6 px-8 gap-4 shadow-sm shadow-secondary-accent rounded-3xl h-full overflow-hidden">
        
        {/* Render Title if provided */}
        {title && (
          <div className="w-full shrink-0">
            {title}
          </div>
        )}

        {/* Render Content */}
        {/* scrollbar-thin typically requires a plugin, ensure it is installed */}
        <div className={`${contentLayoutStyles} scrollbar-thin`}>
          {children}
        </div>

      </div>
    </div>
  )
}

export default Tray
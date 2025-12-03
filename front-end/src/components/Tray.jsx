import React from 'react'

// Added 'title' prop
const Tray = ({ 
  pos = '', 
  size = 'col-span-2', 
  dir = 'flex-col', 
  className = '', 
  variant = 'flex', 
  title, // New prop to handle the header section
  children, 
  ...props 
}) => {
  
  // Define layout styles based on the variant
  // These now only apply to the content wrapper, not the whole tray
  const contentLayoutStyles = variant === 'grid' 
    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 justify-items-center w-full gap-4' 
    : `flex ${dir} w-full`; 

  return (
    <div 
      className={`${pos} ${size} flex flex-col ${className}`} 
      {...props}
    >
      {/* The Visual Container:
        Holds the background, shadow, and padding.
        Always a flex-col to stack Title on top of Content.
      */}
      <div className="flex flex-col items-start justify-start bg-surface py-6 px-8 gap-4 shadow-sm shadow-secondary-accent rounded-3xl h-full">
        
        {/* Render Title if provided */}
        {title && (
          <div className="w-full">
            {title}
          </div>
        )}

        {/* Render Content with specific Grid/Flex layout */}
        <div className={contentLayoutStyles}>
          {children}
        </div>

      </div>
    </div>
  )
}

export default Tray
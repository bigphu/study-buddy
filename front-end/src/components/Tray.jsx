import React from 'react'

// Added 'variant' prop to switch between flex and grid
const Tray = ({ pos = '', size = 'col-span-2', dir='flex-col', className = '', variant = 'flex', children, ...props }) => {
  
  // Define layout styles based on the variant
  const layoutStyles = variant === 'grid' 
    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 justify-items-center' // Grid: Responsive up to 4 columns
    : `flex ${dir}`; // Flex: Original behavior

  return (
    <div 
      className={`${pos} ${size} flex flex-col ${className}`} 
      {...props}
    >
      <div className={`${layoutStyles} items-center justify-center bg-surface py-8 px-10 gap-4 shadow-sm shadow-secondary-accent rounded-3xl`}>
        {children}
      </div>
    </div>
  )
}

export default Tray
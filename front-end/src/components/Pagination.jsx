import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button.jsx';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // State for the jump input field
  const [jumpInput, setJumpInput] = useState('');

  // Handle typing in the input (allow only numbers)
  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setJumpInput(value);
    }
  };

  // Handle "Enter" key press to execute the jump
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const pageNumber = parseInt(jumpInput, 10);
      if (pageNumber >= 1 && pageNumber <= totalPages) {
        onPageChange(pageNumber);
        setJumpInput(''); // Clear input after jumping
      }
    }
  };
  
  // Logic to determine the sequence of page numbers
  const getPageNumbers = () => {
    // If there are very few pages, just show all of them to avoid unnecessary ellipses
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // 1. Always include First, Last, Current, Prev, Next
    const desiredPages = new Set([
      1,
      totalPages,
      currentPage,
      currentPage - 1,
      currentPage + 1
    ]);

    // 2. Filter invalid pages (e.g., 0 or > totalPages) and sort them
    const sortedPages = [...desiredPages]
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);

    // 3. Build the final list with ellipses (...) or filling single-page gaps
    const result = [];
    let prev = 0;

    for (const page of sortedPages) {
      if (prev > 0) {
        const gap = page - prev;
        
        if (gap === 2) {
          // If the gap is just 1 number (e.g., 1 and 3), fill it (add 2) instead of '...'
          result.push(prev + 1);
        } else if (gap > 2) {
          // If the gap is large, add ellipses
          result.push('...');
        }
      }
      result.push(page);
      prev = page;
    }

    return result;
  };

  const pageItems = getPageNumbers();

  return (
    <div className='col-start-2 col-span-10 flex flex-col items-center justify-center gap-4 mb-8 mt-8'>
      
      {/* Jump To Input Section */}
      <div className='group'>
        <div className='flex items-center border focus-within:ring-2 focus-within:ring-offset-2 border-txt-dark transition-all duration-200 focus-within:outline-none group-focus-within:ring-border gap-2 py-2 px-6 rounded-lg bg-surface'>
          <span className="text-sm font-medium text-txt-secondary">Go to page:</span>
          <input
            type='text'
            value={jumpInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder='#'
            className='font-medium font-roboto w-12 bg-transparent text-sm text-txt-primary placeholder-txt-placeholder outline-none text-center'
          />
        </div>
      </div>
      
      {/* Pagination Buttons Section */}
      <div className='flex items-center justify-center gap-2 no-scrollbar max-w-full'>
        {/* Previous Button */}
        <Button 
          variant='secondary' 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          <ChevronLeft size={16} />
        </Button>

        {/* Page Numbers */}
        {pageItems.map((item, index) => (
          item === '...' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-txt-placeholder font-bold">
              ...
            </span>
          ) : (
            <Button
              key={item}
              variant={currentPage === item ? 'primary' : 'secondary'}
              onClick={() => onPageChange(item)}
            >
              {item}
            </Button>
          )
        ))}

        {/* Next Button */}
        <Button 
          variant='secondary' 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
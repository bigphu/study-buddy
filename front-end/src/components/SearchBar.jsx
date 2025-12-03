import React, { useState } from 'react';
import { Search, ChevronDown, ArrowUpAZ, ArrowDownAZ } from 'lucide-react';

import Button from './Button.jsx';

const SearchBar = ({
  onSearch,
  onSortChange,
  onDirectionToggle,
  sortOptions = ['Tutor name', 'Title', 'Status'],
  className = '',
  // New props for defaults
  defaultSearchValue = '',
  defaultSort = 'Tutor name',
  defaultDirection = 'asc'
}) => {
  // Initialize state with the provided defaults
  const [searchValue, setSearchValue] = useState(defaultSearchValue);
  const [selectedSort, setSelectedSort] = useState(defaultSort);
  const [isAscending, setIsAscending] = useState(defaultDirection === 'asc');
  
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Handlers
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchValue(val);
    if (onSearch) {
      // If value is empty, immediately trigger the default search logic
      if (val.trim() === '') {
        // onSearch(defaultSearchValue);
      } else {
        onSearch(val);
      }
    }
  };

  const handleSortSelect = (option) => {
    setSelectedSort(option);
    setIsSortOpen(false);
    if (onSortChange) onSortChange(option);
  };

  const handleDirectionToggle = () => {
    const newDirection = !isAscending;
    setIsAscending(newDirection);
    if (onDirectionToggle) onDirectionToggle(newDirection ? 'asc' : 'desc');
  };

  return (
    <div className={`flex w-full justify-between items-center gap-2 ${className}`}>
      {/* Search zone */}
      <div className='group w-full'>
        <div className='flex items-center border focus-within:ring-2 focus-within:ring-offset-2 border-txt-dark transition-all duration-200 focus-within:outline-none group-focus-within:ring-border gap-2 py-2 px-6 rounded-lg bg-surface'>
          <div className='text-txt-dark group-focus-within:text-txt-accent'>
            <Search size={16} />
          </div>
          <input
            type='text'
            value={searchValue}
            onChange={handleSearchChange}
            placeholder='Search...'
            className='font-medium font-roboto w-full bg-transparent text-sm text-txt-primary placeholder-txt-placeholder outline-none'
          />
        </div>
      </div>

      {/* Sort options */}
      <div className='relative flex-1'>
        <Button onClick={() => setIsSortOpen(!isSortOpen)}>
          <div className='flex items-center gap-1'>
            <ChevronDown size={16} className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
            <span className='mr-2 text-sm truncate'>Sort by {selectedSort}</span>
          </div>
        </Button>

        {/* Dropdown Menu */}
        {isSortOpen && (
          <div className="absolute top-full mt-2 right-0 w-full bg-surface p-2 flex flex-col gap-2 shadow-sm shadow-secondary-accent rounded-lg z-10 overflow-hidden">
            {sortOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleSortSelect(option)}
                className={`w-full text-left px-4 py-2 text-sm font-medium font-outfit hover:bg-secondary-accent hover:text-txt-light rounded-md transition-colors ${selectedSort === option ? 'text-txt-light font-medium font-outfit bg-primary-accent' : 'text-txt-primary'}`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sort direction button */}
      <div className=''>
        <Button
          variant='secondary'
          onClick={handleDirectionToggle}
          title={`Switch to ${isAscending ? 'Descending' : 'Ascending'}`}
        >
          <div className='flex gap-1 h-full items-center'>
            {isAscending ? (
              <>
                <ArrowUpAZ size={16} />
                <span className="text-sm font-medium font-outfit"> ASC</span>
              </>
            ) : (
              <>
                <ArrowDownAZ size={16} />
                <span className="text-sm font-medium font-outfit"> DESC</span>
              </>
            )}
          </div>
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
import React, { useState } from 'react';
import { Search, ArrowUpAZ, ArrowDownAZ, ListFilterIcon } from 'lucide-react';
import InputForm from './InputForm.jsx';
import InputSelect from './InputSelect.jsx';
import Button from './Button.jsx';

const SearchBar = ({
  onSearch,
  onSortChange,
  onDirectionToggle,
  sortOptions = ['Tutor name', 'Title', 'Status'],
  className = '',
  defaultSearchValue = '',
  defaultSort = 'Tutor name',
  defaultDirection = 'asc'
}) => {
  // Initialize state
  const [searchValue, setSearchValue] = useState(defaultSearchValue);
  const [selectedSort, setSelectedSort] = useState(defaultSort);
  const [isAscending, setIsAscending] = useState(defaultDirection === 'asc');

  // Handlers
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchValue(val);
    
    if (onSearch) {
      // If value is empty, immediately trigger the default search logic
      if (val.trim() === '') {
        onSearch(defaultSearchValue);
      } else {
        onSearch(val);
      }
    }
  };

  // Adapted to handle the synthetic event from InputSelect
  const handleSortSelect = (e) => {
    const option = e.target.value;
    setSelectedSort(option);
    if (onSortChange) onSortChange(option);
  };

  const handleDirectionToggle = () => {
    const newDirection = !isAscending;
    setIsAscending(newDirection);
    if (onDirectionToggle) onDirectionToggle(newDirection ? 'asc' : 'desc');
  };

  return (
    <div className={`flex flex-col md:flex-row w-full justify-between items-start md:items-center gap-3 ${className}`}>
      
      {/* Search Input using InputForm */}
      <div className="w-full md:flex-1">
        <InputForm
          name="search"
          placeholder="Search..."
          value={searchValue}
          onChange={handleSearchChange}
          icon={Search}
          // Remove default bottom margin/padding quirks if necessary via className
          className="w-full" 
        />
      </div>

      <div className="flex w-full md:w-auto gap-2 items-center">
        {/* Sort Select using InputSelect */}
        <div className="flex-1 md:w-54">
          <InputSelect
            name="sort"
            value={selectedSort}
            icon={ListFilterIcon}
            options={sortOptions}
            onChange={handleSortSelect}
            placeholder="Sort by"
          />
        </div>

        {/* Sort Direction Toggle */}
        {/* We keep the Button because InputSelect/Form doesn't cover a toggle button use case */}
        <div className="h-full">
          <Button
            variant='secondary'
            onClick={handleDirectionToggle}
            title={`Switch to ${isAscending ? 'Descending' : 'Ascending'}`}
            // Add height to match InputForm/InputSelect standard height (approx 52px-56px based on py-3)
            className="h-[52px] flex items-center justify-center" 
          >
            <div className='flex gap-1 items-center'>
              {isAscending ? (
                <>
                  <ArrowUpAZ size={20} />
                  <span className="hidden lg:inline text-sm font-medium font-outfit">ASC</span>
                </>
              ) : (
                <>
                  <ArrowDownAZ size={20} />
                  <span className="hidden lg:inline text-sm font-medium font-outfit">DESC</span>
                </>
              )}
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
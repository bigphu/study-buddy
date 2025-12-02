import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Icons for Prev/Next

import Tray from '../components/Tray.jsx';
// import ListItem from './ListItem.jsx'; // Uncomment if using list view
import Button from '../components/Button.jsx';
import SearchBar from '../components/SearchBar.jsx';
import CardItem from '../components/CardItem.jsx';

const ITEMS_PER_PAGE = 12;

const LinksCenter = () => {
  // --- 1. State Management ---
  const [links, setLinks] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('status:ongoing');
  const [sortBy, setSortBy] = useState('Tutor name'); 
  const [sortDirection, setSortDirection] = useState('asc'); 

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // --- 2. Data Fetching (Simulation) ---
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        setIsLoading(true);
        
        // MOCK DATA
        // ------------------------------------- BACKEND HERE -------------------------------------
        // const res = await fetch('/api/links'); const mockData = await res.json();
        const mockData = Array.from({ length: 30 }).map((_, idx) => ({
          id: idx,
          courseId: `CO${2000 + idx}`,
          tutorName: idx % 2 === 0 ? 'P-chan' : 'Dr. Smith',
          title: idx % 3 === 0 ? 'Data Structures' : 'Linear Algebra',
          description: `Session description for item ${idx + 1}`,
          status: idx % 4 === 0 ? 'Ended' : idx % 5 === 0 ? 'Processing': 'Ongoing' 
        }));

        setTimeout(() => {
          setLinks(mockData);
          setIsLoading(false);
        }, 500);

      } catch (error) {
        console.error("Failed to fetch links:", error);
        setIsLoading(false);
      }
    };

    fetchLinks();
  }, []);

  // --- 3. Advanced Filtering & Sorting Logic ---
  const processedLinks = useMemo(() => {
    let result = [...links];

    // A. Advanced Search Logic
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      
      // Define supported prefixes for specific attribute search
      // Format: [UserTypedPrefix, ActualDataKey]
      const attributeMap = [
        { prefix: 'status:', key: 'status' },
        { prefix: 'id:', key: 'courseId' },
        { prefix: 'course:', key: 'courseId' },
        { prefix: 'courseId:', key: 'courseId' }, // handle variation
        { prefix: 'tutor:', key: 'tutorName' },
        { prefix: 'tutorname:', key: 'tutorName' },
        { prefix: 'title:', key: 'title' },
      ];

      // Check if the query starts with any known prefix
      const matchedFilter = attributeMap.find(attr => query.startsWith(attr.prefix));

      if (matchedFilter) {
        // --- 1. Specific Attribute Search ---
        // Extract the value after the colon (e.g., "ongoing" from "status:ongoing")
        const valueToFind = query.replace(matchedFilter.prefix, '').trim();
        
        if (valueToFind) {
          result = result.filter(item => {
            const itemValue = item[matchedFilter.key]?.toString().toLowerCase();
            return itemValue?.includes(valueToFind);
          });
        }
      } else {
        // --- 2. Standard Global Search (Fallback) ---
        // If no prefix is found, search across all main fields as before
        result = result.filter(item => 
          item.title.toLowerCase().includes(query) ||
          item.tutorName.toLowerCase().includes(query) ||
          item.courseId.toLowerCase().includes(query)
        );
      }
    }

    // B. Sort
    result.sort((a, b) => {
      let valA, valB;
      switch (sortBy) {
        case 'Tutor name': valA = a.tutorName; valB = b.tutorName; break;
        case 'Title': valA = a.title; valB = b.title; break;
        case 'Status': valA = a.status; valB = b.status; break;
        default: valA = a.tutorName; valB = b.tutorName;
      }
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [links, searchQuery, sortBy, sortDirection]);

  // --- 4. Pagination Logic ---
  
  // Reset to page 1 if search/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, sortDirection]);

  const totalPages = Math.ceil(processedLinks.length / ITEMS_PER_PAGE);
  const currentItems = processedLinks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Header */}
      <div className='col-start-2 col-span-10 flex flex-col min-h-[10vh] p-8 pb-0 items-center justify-center bg-transparent '>
        <div className='font-outfit text-primary-accent text-6xl font-extrabold'>
          Links Center
        </div>
        <div className='text-secondary-accent font-medium font-roboto'>
          This is where all of your registered sessions gather
        </div>
      </div>

      {/* Search Bar */}
      <div className='col-start-4 col-span-6'>
        <SearchBar
          onSearch={setSearchQuery}
          onSortChange={setSortBy}
          onDirectionToggle={(dir) => setSortDirection(dir)}
          sortOptions={['Tutor name', 'Title', 'Status']}
          
          defaultSearchValue="status:ongoing"
          defaultSort="Tutor name"
          defaultDirection="asc"
        />
        {/* Optional: Helper text to show users what they can type */}
        <div className="text-xs text-txt-accent font-roboto font-medium text-center mt-2">
          Try: "status:ongoing", "tutor:P-chan", or "course:CO2003"
        </div>
      </div>

      {/* Grid Content */}
      <Tray pos='col-start-2' size='col-span-10' variant='grid'>
        {isLoading ? (
          <div className="col-span-full text-center text-md font-medium font-outfit text-primary-accent py-10">Loading...</div>
        ) : currentItems.length > 0 ? (
          currentItems.map((link) => (
            <CardItem
              key={link.id}
              itemId={link.courseId}
              tutorName={link.tutorName}
              title={link.title}
              description={link.description}
              status={link.status}
              onViewDetails={() => console.log(`Details: ${link.id}`)}
            />
          ))
        ) : (
          <div className="col-span-full text-center text-md font-medium font-outfit text-primary-accent py-10">
            No results found for "{searchQuery}"
          </div>
        )}
      </Tray>

      {/* Pagination Controls */}
      {processedLinks.length > ITEMS_PER_PAGE ? (
        <div className='col-start-2 col-span-10 flex items-center justify-center gap-2 mb-8 mt-8'>
          <Button variant='secondary' onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            <ChevronLeft size={16} />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'primary' : 'secondary'}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}
          <Button variant='secondary' onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            <ChevronRight size={16} />
          </Button>
        </div>
      ) : (
        <div className='col-start-2 col-span-10 p-8'> 
        </div>
      )}
    </>
  );
};

export default LinksCenter;
import React, { useState, useEffect, useMemo } from 'react';
import { List } from 'lucide-react'

import Tray from '../components/Tray.jsx';
import SearchBar from '../components/SearchBar.jsx';
import CardItem from '../components/CardItem.jsx';
import Pagination from '../components/Pagination.jsx';
import Loading from '../components/Loading.jsx';

const ITEMS_PER_PAGE = 12;

// Define the hierarchy for sorting (Higher number = Higher Rank)
const ACADEMIC_RANK = {
  'Professor': 6,
  'Assoc. Prof': 5,
  'PhD': 4,
  'Master': 3,
  'Bachelor': 2,
  'Student': 1
};

const Discovery = () => {
  // --- 1. State Management ---
  const [links, setLinks] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState(''); 
  const [sortBy, setSortBy] = useState('Tutor name'); 
  const [sortDirection, setSortDirection] = useState('asc'); 

  const [currentPage, setCurrentPage] = useState(1);

  // --- 2. Data Fetching ---
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        setIsLoading(true);
        // MOCK DATA GENERATION
        const academicStatuses = ['Student', 'Bachelor', 'Master', 'PhD', 'Assoc. Prof', 'Professor'];
        
        const mockData = Array.from({ length: 100 }).map((_, idx) => ({
          id: idx,
          courseId: `ID-${1000 + idx}`, 
          tutorName: idx % 2 === 0 ? 'Nguyen Anh Khoa' : 'John Smith',
          title: idx % 3 === 0 ? 'Fullstack Developer' : 'Data Scientist', 
          description: `Experienced tutor specializing in ${idx % 3 === 0 ? 'React & Node' : 'Python & AI'}.`,
          // Randomly assign an academic status from the list above
          academicStatus: academicStatuses[idx % academicStatuses.length],
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

  // --- 3. Filtering & Sorting Logic ---
  const processedLinks = useMemo(() => {
    let result = [...links];

    // Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      const attributeMap = [
        { prefix: 'tutor:', key: 'tutorName' },
        { prefix: 'title:', key: 'title' },
        { prefix: 'academic:', key: 'academicStatus' },
        { prefix: 'rank:', key: 'academicStatus' }, 
      ];

      const matchedFilter = attributeMap.find(attr => query.startsWith(attr.prefix));

      if (matchedFilter) {
        const valueToFind = query.replace(matchedFilter.prefix, '').trim();
        if (valueToFind) {
          result = result.filter(item => {
            const itemValue = item[matchedFilter.key]?.toString().toLowerCase();
            return itemValue?.includes(valueToFind);
          });
        }
      } else {
        result = result.filter(item => 
          item.title.toLowerCase().includes(query) ||
          item.tutorName.toLowerCase().includes(query) ||
          item.courseId.toLowerCase().includes(query) ||
          item.academicStatus.toLowerCase().includes(query)
        );
      }
    }

    // Sort
    result.sort((a, b) => {
      let valA, valB;
      
      switch (sortBy) {
        case 'Tutor name': 
          valA = a.tutorName; 
          valB = b.tutorName; 
          break;
          
        case 'Title': 
          valA = a.title; 
          valB = b.title; 
          break;
          
        case 'Academic Status': 
          // LOOKUP THE RANK: Default to 0 if status is missing/unknown
          valA = ACADEMIC_RANK[a.academicStatus] || 0;
          valB = ACADEMIC_RANK[b.academicStatus] || 0;
          break;
          
        default: 
          valA = a.tutorName; 
          valB = b.tutorName;
      }

      // Comparison Logic
      if (valA < valB) {
        // If ascending: low to high (-1)
        // If descending: high to low (1)
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return result;
  }, [links, searchQuery, sortBy, sortDirection]);

  // --- Pagination Logic ---
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
    }
  };

  return (
    <>
      {/* Header */}
      <div className='col-start-2 col-span-10 flex flex-col min-h-[10vh] p-8 pb-0 items-center justify-center bg-transparent '>
        <div className='font-outfit text-primary-accent text-6xl font-extrabold'>
          Discovery
        </div>
        <div className='text-secondary-accent font-medium font-roboto'>
          Find the perfect mentor based on their academic background
        </div>
      </div>

      <div className='col-start-4 col-span-6'>
        <SearchBar
          onSearch={setSearchQuery}
          onSortChange={setSortBy}
          onDirectionToggle={(dir) => setSortDirection(dir)}
          sortOptions={['Tutor name', 'Title', 'Academic Status']}
          
          defaultSearchValue=""
          defaultSort="Tutor name"
          defaultDirection="asc"
        />
        <div className="text-xs text-gray-400 text-center mt-2">
          Try: "academic:PhD", "tutor:Khoa", or "rank:Professor"
        </div>
      </div>

      <Tray 
        pos='col-start-2' 
        size='col-span-10' 
        variant='grid'
        title={
          <div className="flex items-center justify-start gap-2 w-full border-b border-gray-100 pb-4 mb-2">
            <List className="text-primary-accent" size={24} />
            <h2 className="text-2xl font-bold font-outfit text-primary-accent">
              Available Tutors
            </h2>
          </div>
        }
      >
        {isLoading ? (
          <div className="col-span-full text-center py-10">
            <Loading text='Loading available tutors'></Loading>
          </div>
        ) : currentItems.length > 0 ? (
          currentItems.map((link) => (
            <CardItem
              key={link.id}
              variant='user'
              itemId={link.courseId}
              tutorName={link.tutorName}
              title={link.title}
              description={link.description}
              academicStatus={link.academicStatus}
              onAction={() => console.log(`View profile: ${link.id}`)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            No results found for "{searchQuery}"
          </div>
        )}
      </Tray>

      {/* Pagination Controls */}
      {processedLinks.length > ITEMS_PER_PAGE ? (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      ) : (
        <div className='col-start-2 col-span-10 p-8'> 
        </div>
      )}
    </>
  );
};

export default Discovery;
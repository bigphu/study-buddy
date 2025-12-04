import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

import Tray from '../components/Tray.jsx';
import CardSession from '../components/CardSession.jsx';
import Loading from '../components/Loading.jsx';
import Button from '../components/Button.jsx';
import SearchBar from '../components/SearchBar.jsx'; // Imported
import Pagination from '../components/Pagination.jsx'; // Imported

const ITEMS_PER_PAGE = 8; // Adjusted for sessions (usually bigger cards)

const MySessions = () => {
  const { courseCode } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  
  // --- 1. Data State ---
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 2. Filter & Sort State ---
  const [searchQuery, setSearchQuery] = useState(''); 
  const [sortBy, setSortBy] = useState('Date'); // Default sort by Date for sessions
  const [sortDirection, setSortDirection] = useState('asc'); 
  const [currentPage, setCurrentPage] = useState(1);

  // Helper to map DB Types to Frontend Variants
  const getVariantFromType = (sqlType) => {
    switch (sqlType) {
      case 'Quiz': return 'session-quiz';
      case 'Document': return 'session-pdf';
      case 'Form': return 'session-form';
      default: return 'session-link';
    }
  };

  useEffect(() => {
    const fetchCourseSessions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:5000/api/sessions/${courseCode}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch sessions');

        const data = await response.json();
        
        // Format data
        const formattedData = data.map(item => ({
          ...item,
          variant: getVariantFromType(item.session_type),
          // Ensure dates are usable
          start_time: item.start_time?.replace(' ', 'T'),
          end_time: item.end_time?.replace(' ', 'T'),
        }));

        setSessions(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (token && courseCode) fetchCourseSessions();
  }, [courseCode, token]);

  // --- 3. Filtering & Sorting Logic ---
  const processedSessions = useMemo(() => {
    let result = [...sessions];

    // A. Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      
      // Define prefixes specific to Sessions
      const attributeMap = [
        { prefix: 'type:', key: 'session_type' }, // e.g., "type:quiz"
        { prefix: 'title:', key: 'title' },
        { prefix: 'course:', key: 'course_code' },
        { prefix: 'member:', key: 'member_name' },
      ];

      const matchedFilter = attributeMap.find(attr => query.startsWith(attr.prefix));

      if (matchedFilter) {
        const valueToFind = query.replace(matchedFilter.prefix, '').trim();
        if (valueToFind) {
          result = result.filter(item => 
            item[matchedFilter.key]?.toString().toLowerCase().includes(valueToFind)
          );
        }
      } else {
        // General Search
        result = result.filter(item => 
          item.title?.toLowerCase().includes(query) ||
          item.member_name?.toLowerCase().includes(query) ||
          item.session_type?.toLowerCase().includes(query)
        );
      }
    }

    // B. Sort
    result.sort((a, b) => {
      let valA = '', valB = '';
      
      switch (sortBy) {
        case 'Date': 
          valA = new Date(a.start_time).getTime(); 
          valB = new Date(b.start_time).getTime(); 
          break;
        case 'Title': 
          valA = a.title || ''; 
          valB = b.title || ''; 
          break;
        case 'Type': 
          valA = a.session_type || ''; 
          valB = b.session_type || ''; 
          break;
        default: 
          valA = new Date(a.start_time).getTime(); 
          valB = new Date(b.start_time).getTime(); 
      }
      
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [sessions, searchQuery, sortBy, sortDirection]);

  // --- 4. Pagination Logic ---
  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, sortDirection]);

  const totalPages = Math.ceil(processedSessions.length / ITEMS_PER_PAGE);
  const currentItems = processedSessions.slice(
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
          {courseCode}
        </div>
        <div className='text-secondary-accent font-medium font-roboto'>
          Course Sessions & Materials
        </div>
      </div>


      {/* Search Bar */}
      <div className='col-start-4 col-span-6'>
        <SearchBar
          onSearch={setSearchQuery}
          onSortChange={setSortBy}
          onDirectionToggle={(dir) => setSortDirection(dir)}
          sortOptions={['Date', 'Title', 'Type']} // Options specific to sessions
          defaultSearchValue=""
          defaultSort="Date"
          defaultDirection="asc"
        />
        <div className="text-sm font-medium font-roboto text-txt-accent text-center mt-2">
          Try: "type:quiz", "title:midterm", or "member:Khoa"
        </div>
      </div>

      <div className='col-start-2 col-span-10 flex justify-between items-end'>
        <Button variant='ghost' onClick={() => navigate('/linkscenter')}>
          ← Back to Courses
        </Button>
      </div>

      {/* Sessions Tray */}
      <Tray 
        pos="col-start-2" 
        size="col-span-10" 
        variant="grid" 
        title={
          <div className="flex items-center justify-start gap-2 w-full border-b border-gray-100 pb-4 mb-2">
            <Layers className="text-primary-accent" size={24} />
            <h2 className="text-2xl font-bold font-outfit text-primary-accent">
              Session List
            </h2>
          </div>
        }
      >
        {isLoading ? (
          <div className="col-span-full text-center py-10">
            <Loading text={`Loading ${courseCode} sessions...`} />
          </div>
        ) : error ? (
           <div className="col-span-full text-center text-red-500 py-10">
            {error}
          </div>
        ) : currentItems.length > 0 ? (
          currentItems.map((session) => (
            <CardSession
              key={session.id}
              itemId={session.course_id}
              memberName={session.member_name}
              title={session.title}
              startTime={session.start_time}
              endTime={session.end_time}
              link={session.link}
              variant={session.variant}
            />
          ))
        ) : (
          <div className="col-span-full text-center text-md font-medium font-roboto text-txt-dark py-10">
            No sessions found matching your criteria.
          </div>
        )}
      </Tray>

      {/* Pagination Controls */}
      {processedSessions.length > ITEMS_PER_PAGE ? (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      ) : (
        <div className='col-start-2 col-span-10 p-8'></div>
      )}
    </>
  );
};

export default MySessions;
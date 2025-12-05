import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layers, CheckCircle, List, Plus, PlusCircle } from 'lucide-react'; // Added Icons
import { useAuth } from '../context/AuthContext.jsx';

import Tray from '../components/Tray.jsx';
import CardSession from '../components/CardSession.jsx';
import Loading from '../components/Loading.jsx';
import Button from '../components/Button.jsx';
import SearchBar from '../components/SearchBar.jsx';
import Pagination from '../components/Pagination.jsx';
import ViewToggle from '../components/ViewToggle.jsx'; // Imported

const ITEMS_PER_PAGE = 8;

const MySessions = () => {
  const { courseCode } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  // --- 1. View & Data State ---
  // Default to 'booked' for Students, but 'available' (All) for Tutors
  const [viewMode, setViewMode] = useState(user?.role === 'Tutor' ? 'available' : 'booked');
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 2. Filter & Sort State ---
  const [searchQuery, setSearchQuery] = useState(''); 
  const [sortBy, setSortBy] = useState('Date');
  const [sortDirection, setSortDirection] = useState('asc'); 
  const [currentPage, setCurrentPage] = useState(1);

  // Toggle Options Configuration
  const toggleOptions = [
    { id: 'booked', label: 'My Bookings', icon: CheckCircle },
    { id: 'available', label: 'Available Sessions', icon: List },
  ];

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

        const response = await fetch(`http://localhost:5000/api/sessions/${courseCode}?view=${viewMode}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch sessions');

        const data = await response.json();
        
        const formattedData = data.map(item => ({
          ...item,
          variant: getVariantFromType(item.session_type),
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
  }, [courseCode, token, viewMode]); // Re-fetch when viewMode changes

  // --- 3. Filtering & Sorting Logic ---
  const processedSessions = useMemo(() => {
    let result = [...sessions];

    // A. Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      
      const attributeMap = [
        { prefix: 'type:', key: 'session_type' },
        { prefix: 'title:', key: 'title' },
        { prefix: 'course:', key: 'course_code' },
        { prefix: 'member:', key: 'member_name' },
        { prefix: 'show-all', key: ''},
      ];

      const matchedFilter = attributeMap.find(attr => query.startsWith(attr.prefix));

      if (matchedFilter) {
        const valueToFind = query.replace(matchedFilter.prefix, '').trim();
        if (valueToFind && valueToFind !== 'show-all') {
          result = result.filter(item => 
            item[matchedFilter.key]?.toString().toLowerCase().includes(valueToFind)
          );
        }
      } else {
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
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, sortDirection, viewMode]);

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

  const handleBookSession = async (sessionId) => {
    try {
      const response = await fetch('http://localhost:5000/api/sessions/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Booking failed');
      }

      // Success: Remove the item from the list (or reload)
      setSessions((prev) => prev.filter(s => s.id !== sessionId));
      alert("Session booked successfully!");

    } catch (err) {
      alert(err.message);
    }
  };

  const isTutor = user?.role === 'Tutor';

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

        {/* View Toggle - ONLY visible for Students */}
        {!isTutor && (
          <div className="mt-6">
            <ViewToggle 
              options={toggleOptions} 
              activeId={viewMode} 
              onToggle={setViewMode} 
            />
          </div>
        )}
      </div>

      {/* Search Bar & Controls */}
      <div className='col-start-4 col-span-6'>
        <SearchBar
          onSearch={setSearchQuery}
          onSortChange={setSortBy}
          onDirectionToggle={(dir) => setSortDirection(dir)}
          sortOptions={['Date', 'Title', 'Type']} 
          defaultSearchValue=""
          defaultSort="Date"
          defaultDirection="asc"
        />
        <div className="text-sm font-medium font-roboto text-txt-accent text-center mt-2">
          Try: "type:quiz", "title:midterm", "course:CO2003", "member:Khoa" or "show-all"
        </div>
      </div>

      <div className='col-start-2 col-span-10 flex justify-between items-end'>
        <Button variant='ghost' onClick={() => navigate('/linkscenter')}>
          ← Back to Courses
        </Button>

        {/* Create Button - ONLY visible for Tutors */}
        {isTutor && (
          <Button 
            variant='primary' 
            onClick={() => navigate(`/create-session/${courseCode}`)} // Adjust route as needed
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Create Session
          </Button>
        )}
      </div>

      {/* Sessions Tray */}
      <Tray 
        pos="col-start-2" 
        size="col-span-10" 
        variant="grid" 
        title={
          <div className="flex items-center justify-between w-full border-b border-gray-100 pb-4 mb-2">
            <div className="flex items-center justify-start gap-2">
              <Layers className="text-primary-accent" size={24} />
              <h2 className="text-2xl font-bold font-outfit text-primary-accent">
                {isTutor ? 'Manage Sessions' : (viewMode === 'booked' ? 'My Schedule' : 'Available Sessions')}
              </h2>
            </div>
            {/* Optional: Show count */}
            <span className="text-txt-placeholder font-medium font-roboto">
              {processedSessions.length} items
            </span>
          </div>
        }
      >
        {isLoading ? (
          <div className="col-span-full text-center py-10">
            <Loading text={`Loading ${viewMode} sessions...`} />
          </div>
        ) : error ? (
          <div className="col-span-full text-center text-red-500 py-10">
            {error}
          </div>
        ) : currentItems.length > 0 ? (
          currentItems.map((session) => (
            <CardSession
              key={session.id}
              itemId={session.course_code}
              memberName={session.member_name}
              title={session.title}
              startTime={session.start_time}
              endTime={session.end_time}
              link={session.link}
              variant={session.variant}
              
              // --- LOGIC: Pass Booking Action if in 'Available' mode ---
              actionLabel={!isTutor && viewMode === 'available' ? "Book Session" : null}
              onAction={!isTutor && viewMode === 'available' ? () => handleBookSession(session.id) : null}
            />
          ))
        ) : (
          <div className="col-span-full text-center text-md font-medium font-roboto text-txt-dark py-10 flex flex-col items-center gap-2">
            <span>No sessions found in "{viewMode}".</span>
            {!isTutor && viewMode === 'booked' && (
              <Button variant="ghost" size="sm" onClick={() => setViewMode('available')}>
                Browse Available Sessions
              </Button>
            )}
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
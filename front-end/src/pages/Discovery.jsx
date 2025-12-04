import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Users, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

import Tray from '../components/Tray.jsx';
import SearchBar from '../components/SearchBar.jsx';
import CardUser from '../components/CardUser.jsx';
import CardCourse from '../components/CardCourse.jsx'; 
import Pagination from '../components/Pagination.jsx';
import Loading from '../components/Loading.jsx';

const ITEMS_PER_PAGE = 12;

// --- 1. DEFINE RANKING LOGIC ---
const ACADEMIC_RANK = {
  'Professor': 6,
  'Assoc. Prof': 5,
  'PhD': 4,
  'Master': 3,
  'Bachelor': 2,
  'Student': 1
};

const STATUS_RANK = {
  'Ongoing': 3,
  'Processing': 2,
  'Ended': 1
};

const Discovery = () => {
  // --- State ---
  const [viewMode, setViewMode] = useState('tutors'); 
  const [data, setData] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  // Search & Sort State
  const [searchQuery, setSearchQuery] = useState(''); 
  const [sortBy, setSortBy] = useState('Title'); 
  const [sortDirection, setSortDirection] = useState('asc'); 
  const [currentPage, setCurrentPage] = useState(1);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setData([]); 

        let endpoint = '';
        if (viewMode === 'tutors') {
          endpoint = 'http://localhost:5000/api/tutors';
        } else {
          endpoint = 'http://localhost:5000/api/courses/available';
        }

        const response = await fetch(endpoint, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch discovery data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchData();
  }, [token, viewMode]);

    // --- Handle Enrollment (For Course View) ---
  const handleEnroll = async (courseCode) => {
    if (!window.confirm(`Enroll in ${courseCode}?`)) return;

    try {
      const response = await fetch('http://localhost:5000/api/enroll', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ courseCode })
      });

      if (response.ok) {
        alert("Enrolled successfully!");
        // Remove the course from the list visually
        setData(prev => prev.filter(c => c.course_code !== courseCode));
      } else {
        const err = await response.json();
        alert(`Error: ${err.error}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- 2. UPDATED FILTERING & SORTING LOGIC ---
  const processedData = useMemo(() => {
    let result = [...data];

    // Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      // NOTE: Backend returns 'course_code', 'member_name' (aliased), 'title', 'status'
      const attributeMap = [
        { prefix: 'title:', key: 'title' },
        { prefix: 'name:', key: 'title' },
        { prefix: 'status:', key: 'status' },
        { prefix: 'course:', key: 'course_code' },
        { prefix: 'member:', key: 'member_name' },
        { prefix: 'academic_status:', key: 'academic_status'},
        { prefix: 'rank:', key: 'academic_status'},
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
        result = result.filter(item => 
          item.title?.toLowerCase().includes(query) ||
          item.member_name?.toLowerCase().includes(query) ||
          item.course_code?.toLowerCase().includes(query)
        );
      }
    }

    // Sort Logic
    result.sort((a, b) => {
      let valA, valB;
      
      switch (sortBy) {
        // --- Shared / General ---
        case 'Full Name': // For Tutors
        case 'Member name': // For Courses (if applicable)
          valA = a.full_name || a.member_name; 
          valB = b.full_name || b.member_name; 
          break;
          
        case 'Title': 
          valA = a.title; 
          valB = b.title; 
          break;
        
        case 'Course Code':
            valA = a.course_code;
            valB = b.course_code;
            break;

        // --- Custom Logic: Tutors ---
        case 'Academic Status': 
          valA = ACADEMIC_RANK[a.academic_status] || 0;
          valB = ACADEMIC_RANK[b.academic_status] || 0;
          break;

        // --- Custom Logic: Courses (NEW) ---
        case 'Status':
          // Default to 0 if status is not in the list
          valA = STATUS_RANK[a.status] || 0;
          valB = STATUS_RANK[b.status] || 0;
          break;
          
        default: 
          valA = a.full_name || a.title; 
          valB = b.full_name || b.title;
      }
            
      // Normalize for comparison
      // If values are numbers (ranks), keep them. If strings, ensure lower case.
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      // Comparison
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [data, searchQuery, sortBy, sortDirection, viewMode]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);
  const currentItems = processedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <div className='col-start-2 col-span-10 flex flex-col min-h-[10vh] p-8 pb-0 items-center justify-center bg-transparent '>
        <div className='font-outfit text-primary-accent text-6xl font-extrabold'>
          Discovery
        </div>
        <div className='text-secondary-accent font-medium font-roboto'>
          Expand your knowledge base
        </div>
      </div>

      <div className='col-start-4 col-span-6 flex flex-col gap-4'>
        {/* Toggle Buttons */}
        <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm self-center">
            <button
                onClick={() => { setViewMode('tutors'); setSortBy('Full Name'); }}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-outfit font-bold transition-all ${
                    viewMode === 'tutors' ? 'bg-primary-accent text-white shadow-sm' : 'text-txt-placeholder hover:bg-gray-50'
                }`}
            >
                <Users size={18} /> Tutors
            </button>
            <button
                onClick={() => { setViewMode('courses'); setSortBy('Title'); }}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-outfit font-bold transition-all ${
                    viewMode === 'courses' ? 'bg-primary-accent text-white shadow-sm' : 'text-txt-placeholder hover:bg-gray-50'
                }`}
            >
                <BookOpen size={18} /> Courses
            </button>
        </div>

        {/* --- 3. UPDATED SEARCH BAR PROPS --- */}
        <SearchBar
          onSearch={setSearchQuery}
          onSortChange={setSortBy}
          onDirectionToggle={(dir) => setSortDirection(dir)}
          // Dynamically change options based on viewMode
          sortOptions={
            viewMode === 'tutors' 
            ? ['Full Name', 'Academic Status'] 
            : ['Title', 'Course Code', 'Status'] // Added Status here
          }
          defaultSearchValue=""
          // Reset default sort when switching tabs to avoid "Status" sorting on Tutors
          defaultSort={viewMode === 'tutors' ? 'Full Name' : 'Title'}
          defaultDirection="asc"
        />
      </div>

      <Tray 
        pos='col-start-2' 
        size='col-span-10' 
        variant='grid'
        title={
          <div className="flex items-center justify-start gap-2 w-full border-b border-gray-100 pb-4 mb-2">
            <Compass className="text-primary-accent" size={24} />
            <h2 className="text-2xl font-bold font-outfit text-primary-accent">
              {viewMode === 'tutors' ? 'Available Tutors' : 'Available Courses'}
            </h2>
          </div>
        }
      >
        {isLoading ? (
          <div className="col-span-full text-center py-10">
            <Loading text='Loading results...' />
          </div>
        ) : currentItems.length > 0 ? (
          currentItems.map((item) => (
            viewMode === 'tutors' ? (
                <CardUser 
                    key={item.id}
                    itemId={`${item.id}`}
                    memberName={item.full_name} 
                    title={item.bio ? item.bio.substring(0, 30) + '...' : 'Tutor'} 
                    description={item.bio}
                    academicStatus={item.academic_status} 
                    onAction={() => navigate(`/profile/${item.username}`)}
                />
            ) : (
                <CardCourse
                    key={item.course_id || item.id}
                    itemId={item.course_code}
                    memberName={item.member_name} 
                    title={item.title}
                    description={item.description}
                    status={item.status}
                    btnText="Enroll Now"
                    onAction={() => handleEnroll(item.course_code)}
                />
            )
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-txt-placeholder">
            {viewMode === 'tutors' ? 'No tutors found.' : 'No new courses available to enroll.'}
          </div>
        )}
      </Tray>

      {/* Pagination Controls */}
      {processedData.length > ITEMS_PER_PAGE ? (
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
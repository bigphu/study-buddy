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
import ViewToggle from '../components/ViewToggle.jsx';

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

const VIEW_OPTIONS = [
  { id: 'tutors', label: 'Tutors', icon: Users },
  { id: 'courses', label: 'Courses', icon: BookOpen }
];

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
        { prefix: 'name:', key: 'full_name' },
        { prefix: 'status:', key: 'status' },
        { prefix: 'course:', key: 'course_code' },
        { prefix: 'member:', key: 'member_name' },
        { prefix: 'academic_status:', key: 'academic_status'},
        { prefix: 'rank:', key: 'academic_status'},
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
        <ViewToggle 
          options={VIEW_OPTIONS}
          activeId={viewMode}
          onToggle={(selectedId) => {
            setViewMode(selectedId);
            // Handle the side-effects of switching views
            setSortBy(selectedId === 'tutors' ? 'Full Name' : 'Title');
          }}
        />

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
          defaultSearchValue="show-all"
          // Reset default sort when switching tabs to avoid "Status" sorting on Tutors
          defaultSort={viewMode === 'tutors' ? 'Full Name' : 'Title'}
          defaultDirection="asc"
        />
        <div className="text-sm font-medium font-roboto text-txt-accent text-center mt-2">
          Try: "name:Khoa", "title:web", "status:ongoing", "course:CO2003", "member:Khoa", "academic_status:phd", "rank:phd" or "show-all"
        </div>
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
                    itemId={`${item.username}`}
                    memberName={item.full_name} 
                    title={item.full_name} 
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
          <div className="col-span-full text-center text-sm font-medium font-roboto text-txt-dark py-10">
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
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Plus } from 'lucide-react'; // Added Plus icon
import { useAuth } from '../context/AuthContext.jsx';

import Tray from '../components/Tray.jsx';
import SearchBar from '../components/SearchBar.jsx';
import CardCourse from '../components/CardCourse.jsx';
import Pagination from '../components/Pagination.jsx';
import Loading from '../components/Loading.jsx';
import Button from '../components/Button.jsx'; // Ensure Button is imported

const ITEMS_PER_PAGE = 12;

const STATUS_RANK = {
  'Ongoing': 3,
  'Processing': 2,
  'Ended': 1
};

const LinksCenter = () => {
  const [links, setLinks] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  
  // 1. Destructure 'user' from useAuth to check role
  const { token, user } = useAuth(); 
  const navigate = useNavigate();

  // Search & Sort State
  const [searchQuery, setSearchQuery] = useState('show-all'); 
  const [sortBy, setSortBy] = useState('Status'); 
  const [sortDirection, setSortDirection] = useState('desc'); 
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/api/courses', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setLinks(data);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchCourses();
  }, [token]);

  // --- Filtering & Sorting (Same as before) ---
  const processedLinks = useMemo(() => {
    let result = [...links];

    // Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      const attributeMap = [
        { prefix: 'title:', key: 'title' },
        { prefix: 'name:', key: 'title' },
        { prefix: 'status:', key: 'status' },
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
          item.course_code?.toLowerCase().includes(query)
        );
      }
    }

    // Sort
    result.sort((a, b) => {
      let valA = '', valB = '';
      switch (sortBy) {
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
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [links, searchQuery, sortBy, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedLinks.length / ITEMS_PER_PAGE);
  const currentItems = processedLinks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const handlePageChange = (page) => setCurrentPage(page);

  // Check if User is Tutor
  const isTutor = user?.role === 'Tutor';

  return (
    <>
      <div className='col-start-2 col-span-10 flex flex-col min-h-[10vh] p-8 pb-0 items-center justify-center bg-transparent '>
        <div className='font-outfit text-primary-accent text-6xl font-extrabold'>
          Links Center
        </div>
        <div className='text-secondary-accent font-medium font-roboto'>
          Access your courses and sessions
        </div>
      </div>

      <div className='col-start-4 col-span-6'>
        <SearchBar
          onSearch={setSearchQuery}
          onSortChange={setSortBy}
          onDirectionToggle={(dir) => setSortDirection(dir)}
          sortOptions={['Member Name', 'Title', 'Status']}
          defaultSearchValue="show-all"
          defaultSort="Status"
          defaultDirection="desc"
        />
        <div className="text-sm font-medium font-roboto text-txt-accent text-center mt-2">
          Try: "title:web", "status:ongoing", "course:CO2003", "member:Khoa" or "show-all"
        </div>
      </div>
      
      {/* 2. Create Course Button Area */}
      <div className='col-start-2 col-span-10 flex justify-end items-end'>
        {isTutor && (
          <Button 
            variant='primary' 
            onClick={() => navigate('/create-course')} 
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Create Course
          </Button>
        )}
      </div>

      <Tray 
        pos='col-start-2' 
        size='col-span-10' 
        variant='grid'
        title={
          <div className="flex items-center justify-start gap-2 w-full border-b border-gray-100 pb-4 mb-2">
            <List className="text-primary-accent" size={24} />
            <h2 className="text-2xl font-bold font-outfit text-primary-accent">
              Your Courses
            </h2>
          </div>
        }
      >
        {isLoading ? (
          <div className="col-span-full text-center py-10">
            <Loading text='Loading your courses...'></Loading>
          </div>
        ) : currentItems.length > 0 ? (
          currentItems.map((link) => (
            <CardCourse
              key={link.id || link.course_code} // Ensure unique key
              itemId={link.course_code}
              memberName={link.member_name}
              title={link.title}
              description={link.description}
              status={link.status}
              onAction={() => navigate(`/mysessions/${link.course_code}`)}
            />
          ))
        ) : (
          <div className="col-span-full text-center text-sm font-medium font-roboto text-txt-dark py-10">
            No results found.
          </div>
        )}
      </Tray>

      {processedLinks.length > ITEMS_PER_PAGE ? (
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

export default LinksCenter;
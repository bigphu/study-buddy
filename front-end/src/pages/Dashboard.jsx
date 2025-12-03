import React, { useState, useEffect, useMemo } from 'react';
import { Clock } from 'lucide-react';
import { format, parseISO, isAfter, compareAsc, isFuture } from 'date-fns';

import Tray from '../components/Tray.jsx';
import CardItem from '../components/CardItem.jsx';
import Calendar from '../components/Calendar.jsx';
import Loading from '../components/Loading.jsx';

// --- MOCK DATA BASED ON CNPM.SQL ---
const MOCK_SQL_DATA = [
  // 1. Nhập môn Lập trình
  { id: 1, course_id: 1, tutor_name: 'TS. Nguyễn Anh Khoa', title: 'CO1005 - Nhập môn Lập trình', start_time: null, end_time: null, link: 'meet.google.com/co1005-01' },
  { id: 2, course_id: 1, tutor_name: 'TS. Nguyễn Anh Khoa', title: 'CO1005 - Nhập môn Lập trình', start_time: '2025-12-03 07:00:00', end_time: '2025-12-03 10:00:00', link: 'meet.google.com/co1005-02' },
  // 2. Cấu trúc dữ liệu (Let's make this a Quiz)
  { id: 4, course_id: 2, tutor_name: 'TS. Nguyễn Anh Khoa', title: 'CO2003 - Cấu trúc Dữ liệu (Midterm Quiz)', start_time: '2025-12-02 09:00:00', end_time: '2025-12-02 11:30:00', link: 'meet.google.com/dsa-01' },
  { id: 5, course_id: 2, tutor_name: 'TS. Nguyễn Anh Khoa', title: 'CO2003 - Cấu trúc Dữ liệu & Giải thuật', start_time: '2025-12-04 09:00:00', end_time: '2025-12-04 11:30:00', link: 'meet.google.com/dsa-02' },
  // 6. Cơ sở dữ liệu (Let's make this a PDF Material session)
  { id: 16, course_id: 6, tutor_name: 'ThS. Lê Thị Lan', title: 'CO2013 - Hệ Cơ sở dữ liệu (Reading Material)', start_time: '2025-12-02 14:00:00', end_time: '2025-12-02 17:00:00', link: 'teams.microsoft.com/db-01' },
  // 7. Lập trình Web (Let's make this a Form/Survey)
  { id: 19, course_id: 7, tutor_name: 'ThS. Lê Thị Lan', title: 'CO3049 - Lập trình Web (Course Survey)', start_time: '2025-12-07 08:00:00', end_time: '2025-12-07 11:00:00', link: 'teams.microsoft.com/web-01' },
  // 4. Trí tuệ nhân tạo
  { id: 10, course_id: 4, tutor_name: 'PGS.TS Trần Minh Quân', title: 'CO3001 - Trí tuệ Nhân tạo (AI)', start_time: '2025-12-10 13:00:00', end_time: '2025-12-20 16:00:00', link: 'zoom.us/ai-01' },
];

const Dashboard = () => {
  // --- 1. State Management ---
  const [sessions, setSessions] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  // --- Helper: Determine Variant based on Title or Logic ---
  const determineVariant = (title, link) => {
    const t = title.toLowerCase();
    if (t.includes('quiz') || t.includes('test') || t.includes('exam')) return 'session-quiz';
    if (t.includes('material') || t.includes('pdf') || t.includes('read')) return 'session-pdf';
    if (t.includes('survey') || t.includes('form')) return 'session-form';
    return 'session-link'; // Default
  };

  // --- 2. Data Fetching ---
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API delay
        setTimeout(() => {
          // Normalize Data & Assign Variants
          const formattedData = MOCK_SQL_DATA.map(item => ({
            ...item,
            start_time: item.start_time?.replace(' ', 'T') ?? null, 
            end_time: item.end_time?.replace(' ', 'T') ?? null,
            // Calculate variant here so it's consistent across Dashboard and Calendar
            variant: determineVariant(item.title, item.link)
          }));
          
          setSessions(formattedData);
          setIsLoading(false);
        }, 600);

      } catch (error) {
        console.error("Failed to fetch sessions:", error);
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // --- 3. Compute "Upcoming" Sessions ---
  const upcomingSessions = useMemo(() => {
    const future = sessions.filter(session => 
      session.start_time && isFuture(parseISO(session.start_time))
    );
    future.sort((a, b) => compareAsc(parseISO(a.start_time), parseISO(b.start_time)));
    return future; // Show all or slice if needed
  }, [sessions]);


  return (
    <>
      {/* Header */}
      <div className='col-start-2 col-span-10 flex flex-col min-h-[10vh] p-8 pb-0 items-center justify-center bg-transparent '>
        <div className='font-outfit text-primary-accent text-6xl font-extrabold'>
          Dashboard
        </div>
        <div className='text-secondary-accent font-medium font-roboto'>
          Organize your schedules efficiently and effectively
        </div>
      </div>

      {/* --- SECTION 1: UPCOMING SESSIONS --- */}
      <Tray 
        pos="col-start-2" 
        size="col-span-10" 
        variant="scroll" 
        title={
          <div className="flex items-center justify-start gap-2 w-full border-b border-gray-100 pb-4 mb-2">
            <Clock className="text-primary-accent" size={24} />
            <h2 className="text-2xl font-bold font-outfit text-primary-accent">
              Upcoming Sessions
            </h2>
          </div>
        }
      >
        {isLoading ? (
          <div className="col-span-full text-center py-10">
            <Loading text='Loading upcoming sessions...'></Loading>
          </div>
        ) : upcomingSessions.length > 0 ? (
          upcomingSessions.map((session) => (
            <div key={session.id} className="min-w-auto snap-center">
              <CardItem
                key={session.id}
                // Use the pre-calculated variant to ensure color matches Calendar
                variant={session.variant} 
                itemId={session.course_id}
                tutorName={session.tutor_name}
                title={session.title}
                startTime={session.start_time}
                endTime={session.end_time}
                link={session.link}
                onAction={() => console.log(`Navigating to session ${session.id}`)}
                />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-md font-medium font-outfit text-txt-placeholder py-10">
            No upcoming sessions found.
          </div>
        )}
      </Tray>

      {/* --- SECTION 2: CALENDAR --- */}
      <Tray pos='col-start-2' size='col-span-10' className='mb-16'>
        <Calendar 
          sessions={sessions} 
          isLoading={isLoading} 
        />
      </Tray>
    </>
  );
};

export default Dashboard;
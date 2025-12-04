import React, { useState, useEffect, useMemo } from 'react';
import { Clock } from 'lucide-react';
import { parseISO, compareAsc, isFuture } from 'date-fns';
import { useAuth } from '../context/AuthContext.jsx';

import Tray from '../components/Tray.jsx';
import CardSession from '../components/CardSession.jsx';
import Calendar from '../components/Calendar.jsx';
import Loading from '../components/Loading.jsx';

const Dashboard = () => {
  const [sessions, setSessions] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  const getVariantFromType = (sqlType) => {
    switch (sqlType) {
      case 'Quiz':      return 'session-quiz';
      case 'Document':  return 'session-pdf';
      case 'Form':      return 'session-form';
      default:          return 'session-link';
    }
  };

  useEffect(() => {
    const fetchAllSessions = async () => {
      try {
        setIsLoading(true);
        // Assumes backend has endpoint for "All User Sessions"
        const response = await fetch('http://localhost:5000/api/sessions/all', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();

          console.log(data);

          // const data = [
          //   { id: 1, course_id: 1, member_name: 'TS. Nguyễn Anh Khoa', title: 'CO1005 - Nhập môn Lập trình', start_time: null, end_time: null, link: 'meet.google.com/co1005-01' },
          //     { id: 2, course_id: 1, member_name: 'TS. Nguyễn Anh Khoa', title: 'CO1005 - Nhập môn Lập trình', start_time: '2025-12-03 07:00:00', end_time: '2025-12-03 10:00:00', link: 'meet.google.com/co1005-02' },
          //     // 2. Cấu trúc dữ liệu (Let's make this a Quiz)
          //     { id: 4, course_id: 2, member_name: 'TS. Nguyễn Anh Khoa', title: 'CO2003 - Cấu trúc Dữ liệu (Midterm Quiz)', start_time: '2025-12-02 09:00:00', end_time: '2025-12-02 11:30:00', link: 'meet.google.com/dsa-01' },
          //     { id: 5, course_id: 2, member_name: 'TS. Nguyễn Anh Khoa', title: 'CO2003 - Cấu trúc Dữ liệu & Giải thuật', start_time: '2025-12-04 09:00:00', end_time: '2025-12-04 11:30:00', link: 'meet.google.com/dsa-02' },
          //     // 6. Cơ sở dữ liệu (Let's make this a PDF Material session)
          //     { id: 16, course_id: 6, member_name: 'ThS. Lê Thị Lan', title: 'CO2013 - Hệ Cơ sở dữ liệu (Reading Material)', start_time: '2025-12-02 14:00:00', end_time: '2025-12-02 17:00:00', link: 'teams.microsoft.com/db-01' },
          //     // 7. Lập trình Web (Let's make this a Form/Survey)
          //     { id: 19, course_id: 7, member_name: 'ThS. Lê Thị Lan', title: 'CO3049 - Lập trình Web (Course Survey)', start_time: '2025-12-07 08:00:00', end_time: '2025-12-07 11:00:00', link: 'teams.microsoft.com/web-01' },
          //     // 4. Trí tuệ nhân tạo
          //     { id: 10, course_id: 4, member_name: 'PGS.TS Trần Minh Quân', title: 'CO3001 - Trí tuệ Nhân tạo (AI)', start_time: '2025-12-10 13:00:00', end_time: '2025-12-20 16:00:00', link: 'zoom.us/ai-01' },
          //   ];
          
          const formattedData = data.map(item => ({
            ...item,
            start_time: item.start_time?.replace(' ', 'T'), 
            end_time: item.end_time?.replace(' ', 'T'),
            variant: getVariantFromType(item.session_type)
          }));
          
          setSessions(formattedData);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchAllSessions();
  }, [token]);

  const upcomingSessions = useMemo(() => {
    const future = sessions.filter(session => 
      session.start_time && isFuture(parseISO(session.start_time)) ||
      session.end_time && isFuture(parseISO(session.end_time))
    );
    future.sort((a, b) => compareAsc(parseISO(a.start_time), parseISO(b.start_time)));
    return future; 
  }, [sessions]);


  return (
    <>
      <div className='col-start-2 col-span-10 flex flex-col min-h-[10vh] p-8 pb-0 items-center justify-center bg-transparent '>
        <div className='font-outfit text-primary-accent text-6xl font-extrabold'>
          Dashboard
        </div>
        <div className='text-secondary-accent font-medium font-roboto'>
          Organize your schedules efficiently and effectively
        </div>
      </div>

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
              <CardSession
                itemId={session.course_code} // Use Course Code here for display
                memberName={session.member_name} // Assumes backend join returns this
                title={session.title}
                startTime={session.start_time}
                endTime={session.end_time}
                link={session.link}
                variant={session.variant}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-md font-medium font-roboto text-txt-dark py-10">
            No upcoming sessions found
          </div>
        )}
      </Tray>

      <Tray pos='col-start-2' size='col-span-10' className='mb-16'>
        <Calendar sessions={sessions} isLoading={isLoading} />
      </Tray>

      <div className='col-start-2 col-span-10 p-8'></div>
    </>
  );
};

export default Dashboard;
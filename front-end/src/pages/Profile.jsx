import React, { useState, useEffect } from 'react';
import { User, Mail, BookOpen, GraduationCap, MapPin, Edit3, Settings } from 'lucide-react';

import Tray from '../components/Tray.jsx';
import CardItem from '../components/CardItem.jsx';
import Button from '../components/Button.jsx';
import Loading from '../components/Loading.jsx';

const Profile = () => {
  // --- 1. State Management ---
  const [userProfile, setUserProfile] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 2. Data Fetching (Mocking SQL Query) ---
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);

        // SIMULATED API DELAY
        setTimeout(() => {
          
          // MOCK USER DATA (Based on cnpm.sql - User ID 2: 'tutor_khoa')
          // Toggle this variable to test 'student' view vs 'tutor' view
          const MOCK_USER_TYPE = 'tutor'; // 'tutor' or 'student'

          let userData, courseData;

          if (MOCK_USER_TYPE === 'tutor') {
            // Data for TS. Nguyễn Anh Khoa
            userData = {
              id: 2,
              username: 'tutor_khoa',
              fullName: 'TS. Nguyễn Anh Khoa',
              role: 'tutor',
              bio: 'Tiến sĩ KHMT, chuyên sâu về Giải thuật. Đam mê nghiên cứu tối ưu hóa và trí tuệ nhân tạo.',
              email: 'khoa.nguyen@hcmut.edu.vn',
              academicStatus: 'PhD',
              location: 'Ho Chi Minh City, Vietnam',
              joinDate: 'Sept 2020'
            };
            
            // Courses from SQL where tutor_id = 1
            courseData = [
              { id: 1, courseId: 'CO1005', title: 'Nhập môn Lập trình', description: 'Tư duy lập trình C/C++, con trỏ.', status: 'Open' },
              { id: 2, courseId: 'CO2003', title: 'Cấu trúc Dữ liệu & Giải thuật', description: 'Stack, Queue, Tree, Graph. Quan trọng.', status: 'Ongoing' },
              { id: 3, courseId: 'CO_CP', title: 'Lập trình Thi đấu', description: 'Quy hoạch động, Segment Tree.', status: 'Open' }
            ];

          } else {
            // Data for Student (e.g., User ID 6: Trần Văn Nam)
            userData = {
              id: 6,
              username: 'hcmut_k21_nam',
              fullName: 'Trần Văn Nam',
              role: 'student',
              bio: 'Sinh viên K21. Yêu thích lập trình Web và Mobile.',
              email: 'nam.tran@hcmut.edu.vn',
              academicStatus: 'Student',
              location: 'Dormitory A, VNU-HCM',
              joinDate: 'Aug 2021'
            };

            // Enrollments from SQL
            courseData = [
              { id: 1, courseId: 'CO1005', title: 'Nhập môn Lập trình', tutorName: 'TS. Nguyễn Anh Khoa', description: 'Tư duy lập trình C/C++, con trỏ.', status: 'Finished' },
              { id: 4, courseId: 'CO3001', title: 'Trí tuệ Nhân tạo (AI)', tutorName: 'PGS.TS Trần Minh Quân', description: 'Tìm kiếm A*, Logic, ML cơ bản.', status: 'Ongoing' }
            ];
          }

          setUserProfile(userData);
          setRelatedCourses(courseData);
          setIsLoading(false);
        }, 800);

      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (isLoading) {
    return <Loading fullScreen text="Loading profile..." />;
  }

  return (
    <>
      {/* --- HEADER SECTION --- */}
      <div className='col-start-2 col-span-10 flex flex-col pt-8 pb-4 items-center justify-center bg-transparent'>
        <div className='font-outfit text-primary-accent text-6xl font-extrabold'>
          My Profile
        </div>
        <div className='text-secondary-accent font-medium font-roboto'>
          Manage your personal information and account settings
        </div>
      </div>

      {/* --- PERSONAL INFO CARD --- */}
      <div className="col-start-3 col-span-8 mb-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Cover / Top Banner */}
          <div className="h-32 bg-gradient-to-r from-indigo-50 to-blue-50 relative">
            <div className="absolute right-4 top-4">
              <Button variant="ghost" size="sm">
                <Settings size={18} />
              </Button>
            </div>
          </div>

          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row gap-6 items-start -mt-12">
              
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-md bg-white flex items-center justify-center overflow-hidden">
                  {/* Placeholder for Avatar */}
                  <User size={64} className="text-gray-300" />
                </div>
                
                {/* Role Badge */}
                <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                  userProfile.role === 'tutor' 
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-200' 
                    : 'bg-green-100 text-green-700 border-green-200'
                }`}>
                  {userProfile.academicStatus || userProfile.role}
                </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 pt-2 md:pt-14 flex flex-col gap-4">
                
                {/* Name & Bio */}
                <div>
                  <h2 className="text-3xl font-bold font-outfit text-txt-dark">
                    {userProfile.fullName}
                  </h2>
                  <p className="text-txt-secondary font-medium font-roboto mt-1">
                    @{userProfile.username}
                  </p>
                  <p className="text-txt-primary mt-3 leading-relaxed max-w-2xl">
                    {userProfile.bio}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="flex flex-wrap gap-4 text-sm text-txt-secondary font-medium border-t border-gray-100 pt-4 mt-2">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-primary-accent" />
                    {userProfile.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-primary-accent" />
                    {userProfile.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap size={16} className="text-primary-accent" />
                    Joined {userProfile.joinDate}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-14 shrink-0">
                <Button variant="secondary">
                  <div className="flex items-center gap-2">
                    <Edit3 size={16} />
                    <span>Edit Profile</span>
                  </div>
                </Button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* --- COURSES SECTION (TRAY) --- */}
      <Tray 
        pos='col-start-2' 
        size='col-span-10' 
        variant='grid'
        title={
          <div className="flex items-center justify-between w-full border-b border-gray-100 pb-4 mb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="text-primary-accent" size={24} />
              <h2 className="text-2xl font-bold font-outfit text-primary-accent">
                {userProfile.role === 'tutor' ? 'Teaching Courses' : 'Enrolled Courses'}
              </h2>
            </div>
            <span className="text-sm font-medium text-txt-placeholder bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              {relatedCourses.length} Active
            </span>
          </div>
        }
      >
        {relatedCourses.length > 0 ? (
          relatedCourses.map((course) => (
            <CardItem
              key={course.id}
              variant="course"
              itemId={course.courseId}
              // If tutor, display their own name, if student, display the course's tutor
              tutorName={userProfile.role === 'tutor' ? userProfile.fullName : course.tutorName}
              title={course.title}
              description={course.description}
              status={course.status}
              onAction={() => console.log(`View Course Details: ${course.courseId}`)}
            />
          ))
        ) : (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-txt-placeholder gap-2 border-2 border-dashed border-gray-100 rounded-3xl">
            <BookOpen size={48} className="opacity-20" />
            <p className="font-medium">No courses associated with this profile yet.</p>
          </div>
        )}
      </Tray>
      
      {/* Bottom Spacer */}
      <div className="col-span-12 h-16"></div>
    </>
  );
};

export default Profile;
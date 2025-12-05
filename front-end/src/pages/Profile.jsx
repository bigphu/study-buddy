import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams
import { useAuth } from '../context/AuthContext.jsx';
import CardProfile from '../components/CardProfile.jsx';
import Loading from '../components/Loading.jsx';

const Profile = () => {
  const { username } = useParams(); // Get username from URL if present
  const { token, user: currentUser } = useAuth();
  
  const [userProfile, setUserProfile] = useState(null);
  const [stats, setStats] = useState({ courses: 0, sessions: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        
        // Determine URL: If username param exists, fetch that user. Else fetch 'me'.
        // Backend should support: /api/profile?username=... OR /api/profile (for self)
        let url = 'http://localhost:5000/api/profile';
        if (username) {
            url += `?username=${username}`;
        }

        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          
          // Map DB response to Component props
          const formattedUser = {
            id: data.id,
            username: data.username,
            role: data.role,
            fullName: data.full_name,
            academicStatus: data.academic_status,
            bio: data.bio,
          };
          
          setStats({
            courses: data.stat_courses,
            sessions: data.stat_sessions
          });

          setUserProfile(formattedUser);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchProfileData();
  }, [token, username]);

  if (isLoading) {
    return <Loading fullScreen text="Loading profile..." />;
  }

  // Determine if this is the logged-in user's profile (allow edit)
  const isOwnProfile = !username || (currentUser && currentUser.username === username);

  return (
    <>
      <div className='col-start-2 col-span-10 flex flex-col min-h-[10vh] p-8 pb-0 items-center justify-center bg-transparent '>
        <div className='font-outfit text-primary-accent text-6xl font-extrabold'>
          Profile
        </div>
        <div className='text-secondary-accent font-medium font-roboto'>
          {isOwnProfile ? "Manage your identity" : `Viewing profile of @${userProfile?.username}`}
        </div>
      </div>

      <div className="col-start-4 col-span-6 mb-8">
        <CardProfile 
          user={userProfile} 
          stats={stats} 
          allowEdit={isOwnProfile}
          onEditProfile={isOwnProfile ? () => alert("Edit Modal") : undefined}
        />
      </div>
      <div className="col-span-12 h-16"></div>
    </>
  );
};

export default Profile;
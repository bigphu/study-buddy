import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, LayoutDashboard, Link as LinkIcon, Bell, LogOut, User, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Button from './Button.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Logic: Hide navigation items on specific routes (Legacy logic preserved)
  const onlyLogoRoutes = ['/login', '/register'];
  const isOnlyLogo = onlyLogoRoutes.includes(location.pathname);

  // --- STYLING ---
  
  // 1. Link Styles (Based on your uploaded file, but added Flex + Gap for Icons)
  const baseLinkClass =
    'flex items-center gap-2 transition-colors duration-300 decoration-2 underline-offset-8 decoration-secondary-accent font-medium';

  const getLinkClass = ({ isActive }) => {
    return isActive
      ? `${baseLinkClass} text-txt-light underline` // Active: Bright White + Underline
      : `${baseLinkClass} text-txt-placeholder hover:text-txt-light`; // Inactive: Grey + Hover White
  };

  return (
    // CONTAINER: Kept exactly as your uploaded file (bg-primary, h-[10%], etc.)
    <div className='sticky top-0 left-0 w-full h-[10%] bg-primary shadow-md mb-auto z-50'>
      <nav className='mx-auto flex h-[10vh] max-w-10xl items-center justify-around px-8'>
        
        {/* 1. LOGO (Updated to Text Logo "Like the new one") */}
        <div className='shrink-0'>
          <div 
            className='text-2xl font-extrabold font-outfit text-white tracking-tight cursor-pointer select-none' 
            onClick={() => navigate('/home')}
          >
            StudyBuddy<span className='text-secondary-accent'>.</span>
          </div>
        </div>

        {/* 2. CENTER NAVIGATION (Hidden on Login/Register OR if not logged in) */}
        {!isOnlyLogo && user && (
          <div className='justify-center flex'>
            <ul className='flex items-center gap-8'>
              <li>
                <NavLink to='/home' className={getLinkClass}>
                  <Home size={18} />
                  <span>Home</span>
                </NavLink>
              </li>
              <li>
                <NavLink to='/discovery' className={getLinkClass}>
                  <Compass size={18} />
                  <span>Discovery</span>
                </NavLink>
              </li>
              <li>
                <NavLink to='/dashboard' className={getLinkClass}>
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </NavLink>
              </li>
              <li>
                <NavLink to='/linkscenter' className={getLinkClass}>
                  <LinkIcon size={18} />
                  <span>Links</span>
                </NavLink>
              </li>
            </ul>
          </div>
        )}

        {/* 3. RIGHT SIDE ACTIONS */}
        <div className='flex items-center gap-4'>
          {user ? (
            // --- LOGGED IN STATE ---
            <>
              {/* Notification Button */}
              <button
                type='button'
                className='text-txt-placeholder transition-colors hover:text-txt-light active:text-secondary-accent'
                aria-label='Notifications'
              >
                <Bell className="h-6 w-6" />
              </button>

              {/* Profile Chip (Adapted for Dark Background) */}
              <div 
                className='flex items-center gap-3 pl-2 pr-1 border-l border-white/10 cursor-pointer hover:opacity-80 transition-opacity group'
                onClick={() => navigate(`/profile/${user.username}`)}
              >
                {/* Text Info */}
                <div className='text-right hidden lg:block'>
                  <div className='text-sm font-bold text-txt-light font-outfit leading-tight group-hover:text-secondary-accent transition-colors'>
                    {user.fullName}
                  </div>
                  <div className='text-xs text-txt-placeholder font-medium capitalize'>
                    {user.role}
                  </div>
                </div>
                
                {/* Avatar Circle */}
                <div className='w-9 h-9 bg-linear-to-tr from-secondary-accent to-white/20 rounded-full flex items-center justify-center text-white font-bold shadow-sm border border-white/20'>
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : <User size={16}/>}
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className='ml-2 text-txt-placeholder hover:text-red-400 transition-colors'
                title="Log out"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            // --- GUEST STATE (Login/Register) ---
            !isOnlyLogo && (
              <div className='flex gap-4 items-center'>
                <NavLink to="/login" className="text-txt-light font-bold hover:text-secondary-accent transition-colors">
                  Log In
                </NavLink>
              </div>
            )
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
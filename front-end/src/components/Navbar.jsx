import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import logo from '../assets/logo.png';
import avatar from '../assets/avatar.png';

const Navbar = () => {
  const location = useLocation();

  // Logic: Hide navigation items on specific routes (e.g. Login)
  const onlyLogoRoutes = ['/login', '/register'];
  const isOnlyLogo = onlyLogoRoutes.includes(location.pathname);

  // Styling: Common classes for all links
  const baseLinkClass =
    'transition-colors duration-300 decoration-2 underline-offset-8 decoration-secondary-accent font-medium';

  // Logic: Switch classes based on whether the link is Active or Inactive
  const getLinkClass = ({ isActive }) => {
    return isActive
      ? `${baseLinkClass} text-txt-light underline` // Active: Bright White + Underline
      : `${baseLinkClass} text-txt-placeholder hover:text-txt-light`; // Inactive: Grey + Hover White
  };

  const baseAvatarClass = 'w-10 h-10 rounded-full border-2 object-cover mr-3';
  const getAvatarClass = ({ isActive }) => {
    return isActive
      ? `${baseAvatarClass} border-border` // Active: Bright White + Underline
      : `${baseAvatarClass} border-txt-placeholder hover:border-white`; // Inactive: Grey + Hover White
  };

  return (
    <div className='sticky top-0 left-0 w-full h-[10%] bg-primary shadow-md mb-auto z-50'>
      <nav className='mx-auto flex h-[10vh] max-w-6xl items-center justify-between px-8'>
        {/* LOGO SECTION */}

        <div className='shrink-0'>
          {
            isOnlyLogo ? (
              <img className='w-16 object-contain' src={logo} alt='Logo' />
            ) : (
              <NavLink to='/home'>
                <img className='w-16 object-contain' src={logo} alt='Logo' />
              </NavLink>
            )
          }
        </div>

        {/* HIDE LINKS ON LOGIN PAGE */}
        {!isOnlyLogo && (
          <>
            {/* CENTER NAVIGATION */}
            <div className='justify-center flex'>
              <ul className='flex items-center gap-8'>
                <li>
                  <NavLink to='/home' className={getLinkClass}>
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink to='/discovery' className={getLinkClass}>
                    Discovery
                  </NavLink>
                </li>
                <li>
                  <NavLink to='/dashboard' className={getLinkClass}>
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink to='/linkscenter' className={getLinkClass}>
                    Links Center
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* RIGHT SIDE ACTIONS */}
            <div className='flex items-center gap-4'>
              {/* Notification Button */}
              {/* TODO: MAKE THIS BUTTON WORK */}
              <button
                type='button'
                className='text-txt-placeholder transition-colors hover:text-txt-light active:text-txt-accent'
                aria-label='Notifications'
              >
                <Bell className="h-6 w-6" />
              </button>

              {/* Profile Button */}
              <NavLink
                to='/profile'
                className={getAvatarClass}
              >
                <img src={avatar} alt='{avatar}' className='rounded-full w-full h-full object-cover' />
              </NavLink>
            </div>
          </>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
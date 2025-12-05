import React from 'react';
import { User, Edit3, ShieldCheck, BookOpen, Activity, Layers, Hash } from 'lucide-react';
import Button from './Button.jsx';

const CardProfile = ({
  user,
  stats = { courses: 0, sessions: 0 },
  allowEdit = false,
  onEditProfile,
  className = ''
}) => {
  if (!user) return null;

  const isTutor = user.role === 'Tutor';
  
  // --- VISUAL THEME ---
  const theme = isTutor ? {
    border: 'border-indigo-200',
    bgBadge: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    bgHeader: 'bg-indigo-50',
    iconColor: 'text-indigo-500' 
  } : {
    border: 'border-emerald-200',
    bgBadge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    bgHeader: 'bg-emerald-50',
    iconColor: 'text-emerald-500' 
  };

  // --- ICON SELECTION ---
  const CourseIcon = isTutor ? Layers : BookOpen; 
  const SessionIcon = Activity;

  return (
    <div className={`w-full bg-white rounded-3xl border ${theme.border} shadow-sm overflow-hidden flex flex-col ${className}`}>
      
      {/* Header Section */}
      <div className={`${theme.bgHeader} p-6 relative flex justify-between items-start h-36`}>
        {/* Avatar Placeholder */}
        <div className="bg-white rounded-2xl shadow-sm p-3 inline-flex items-center justify-center border border-white/50">
          <User size={32} className={theme.iconColor} />
        </div>

        {/* Academic Status Badge (Moved Role to Metadata) */}
        <div className={`text-xs font-bold px-4 py-2 rounded-full border font-outfit uppercase tracking-wide ${theme.bgBadge}`}>
          {user.academicStatus || 'Member'}
        </div>
      </div>

      {/* Body Section */}
      <div className="p-8 flex flex-col gap-6 grow bg-white">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold font-outfit text-txt-dark">
            {user.fullName}
          </h2>
          <span className="text-txt-placeholder font-medium font-roboto text-sm">
            @{user.username}
          </span>
        </div>

        {/* Bio */}
        <div className="text-txt-dark leading-relaxed font-roboto">
          {user.bio || "No biography provided."}
        </div>

        {/* Metadata Grid */}
        <div className="flex flex-col gap-3 pt-6 border-t border-gray-100">
          
          {/* Row 1: System Info (ID & Role) */}
          <div className="flex items-center gap-6">
             {/* User ID */}
            <div className="flex items-center gap-3 text-sm font-medium text-txt-secondary">
                <Hash size={20} className={theme.iconColor} /> 
                <span>
                ID: <span className="text-txt-dark font-semibold">#{user.id}</span>
                </span>
            </div>

            {/* System Role */}
            <div className="flex items-center gap-3 text-sm font-medium text-txt-secondary">
                <ShieldCheck size={20} className={theme.iconColor} /> 
                <span className="capitalize">
                Role: <span className="text-txt-dark font-semibold">{user.role}</span>
                </span>
            </div>
          </div>

          {/* Row 2: Stats Grid */}
          <div className="flex justify-start gap-6 mt-2">
            {/* Courses */}
            <div className="flex items-center gap-3 text-sm font-medium text-txt-secondary">
              <CourseIcon size={20} className={theme.iconColor} />
              <span>{stats.courses} Courses</span>
            </div>
            
            {/* Sessions */}
            <div className="flex items-center gap-3 text-sm font-medium text-txt-secondary">
              <SessionIcon size={20} className={theme.iconColor} />
              <span>{stats.sessions} Sessions</span>
            </div>
          </div>

        </div>

        {/* Edit Action */}
        { allowEdit && (
            <div className="mt-4">
              <Button 
                onClick={onEditProfile} 
                variant="secondary" 
                className="w-full justify-center"
              >
                <div className="flex items-center justify-center gap-2">
                  <Edit3 size={16} />
                  <span>Edit Profile</span>
                </div>
              </Button>
            </div>
          )
        }
      </div>
    </div>
  );
};

export default CardProfile;
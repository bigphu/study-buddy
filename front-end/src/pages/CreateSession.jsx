import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link as LinkIcon, Clock, Type, Layers, Users, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import Tray from '../components/Tray.jsx'; // Imported Tray
import InputForm from '../components/InputForm.jsx';
import InputSelect from '../components/InputSelect.jsx';
import Button from '../components/Button.jsx';

const CreateSession = () => {
  const { courseCode } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    type: 'Meeting',
    assignMode: 'Manual',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  });

  // Helper to check if we need date inputs
  const isDocument = formData.type === 'Document';

  const handleChange = (e) => {
    // Handle both standard inputs and InputSelect mock events
    const name = e.target.name;
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Logic: If Document, backend handles NULL times, but we send empty strings or formatted dates otherwise
    let startDateTime = null;
    let endDateTime = null;

    if (!isDocument) {
        if (!formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
            setError("Date and Time are required for this session type.");
            setIsLoading(false);
            return;
        }
        startDateTime = `${formData.startDate} ${formData.startTime}:00`;
        endDateTime = `${formData.endDate} ${formData.endTime}:00`;
    }

    try {
      const response = await fetch('http://localhost:5000/api/sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseCode,
          title: formData.title,
          link: formData.link,
          type: formData.type,
          assignMode: formData.assignMode,
          startTime: startDateTime,
          endTime: endDateTime,
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create session');

      navigate(`/mysessions/${courseCode}`);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 1. Header Section (Same visual style as MySessions) */}
      <div className='col-start-2 col-span-10 flex flex-col min-h-[10vh] p-8 pb-0 items-center justify-center bg-transparent'>
        <div className='font-outfit text-primary-accent text-6xl font-extrabold'>
          {courseCode}
        </div>
        <div className='text-secondary-accent font-medium font-roboto'>
          Create New Session
        </div>
      </div>

      {/* 2. Navigation Control */}
      <div className='col-start-2 col-span-10 flex justify-start items-end mb-4'>
        <Button variant='ghost' onClick={() => navigate(-1)}>
          ← Cancel & Return
        </Button>
      </div>

      {/* 3. The Tray Container */}
      <Tray 
        pos="col-start-3" // Centered, slightly narrower than full width
        size="col-span-8" 
        variant="flex" // Use flex for a vertical form layout
        title={
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-2">
            <Layers className="text-primary-accent" size={24} />
            <h2 className="text-2xl font-bold font-outfit text-primary-accent">
              Session Details
            </h2>
          </div>
        }
      >
        {error && (
          <div className="p-3 mb-4 text-sm font-medium text-red-600 bg-red-50 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
          
          {/* Row 1: Title & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputForm 
              label="Session Title" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              placeholder="e.g. Week 4: Calculus Review" 
              required 
            />
            <InputSelect 
              label="Session Type" 
              name="type" 
              value={formData.type} 
              onChange={handleChange} 
              options={['Meeting', 'Quiz', 'Form', 'Document']}
              icon={Type}
            />
          </div>

          {/* Row 2: Link & Assign Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputForm 
              label="Resource Link" 
              name="link" 
              value={formData.link} 
              onChange={handleChange} 
              placeholder={isDocument ? "Link to PDF/Drive..." : "https://zoom.us/..."} 
              icon={LinkIcon}
              required 
            />
            <InputSelect 
              label="Assignment Mode" 
              name="assignMode" 
              value={formData.assignMode} 
              onChange={handleChange} 
              options={['Manual', 'Auto_All']}
              icon={Users}
            />
          </div>

          {/* Row 3 & 4: Dates (Hidden if Document) */}
          {!isDocument && (
            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-col gap-4 transition-all duration-300">
                <div className="flex items-center gap-2 text-txt-secondary mb-2">
                    <Calendar size={18} />
                    <span className="text-sm font-bold font-outfit uppercase tracking-wider">Schedule</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <InputForm 
                    label="Start Date" name="startDate" type="date" 
                    value={formData.startDate} onChange={handleChange} required 
                    />
                    <InputForm 
                    label="Start Time" name="startTime" type="time" 
                    value={formData.startTime} onChange={handleChange} icon={Clock} required 
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <InputForm 
                    label="End Date" name="endDate" type="date" 
                    value={formData.endDate} onChange={handleChange} required 
                    />
                    <InputForm 
                    label="End Time" name="endTime" type="time" 
                    value={formData.endTime} onChange={handleChange} icon={Clock} required 
                    />
                </div>
            </div>
          )}

          {isDocument && (
            <div className="p-4 bg-blue-50 text-blue-700 rounded-xl text-sm font-roboto border border-blue-100">
                <strong>Note:</strong> Documents are always available and do not require start/end times.
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center gap-4 pt-4 border-t border-gray-100">
            <Button 
                type="submit" 
                isLoading={isLoading} 
                className="w-full md:w-auto md:px-12"
            >
              Confirm Creation
            </Button>
          </div>

        </form>
      </Tray>

      <div className='col-start-2 col-span-10 p-8'></div>
    </>
  );
};

export default CreateSession;
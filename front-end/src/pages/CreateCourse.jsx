import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Type, AlignLeft, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import Tray from '../components/Tray.jsx';
import InputForm from '../components/InputForm.jsx';
import Button from '../components/Button.jsx';

const CreateCourse = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    courseCode: '',
    title: '',
    description: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/courses/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create course');

      // Success: Go back to the course list
      navigate('/linkscenter');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 1. Header Section */}
      <div className='col-start-2 col-span-10 flex flex-col min-h-[10vh] p-8 pb-0 items-center justify-center bg-transparent'>
        <div className='font-outfit text-primary-accent text-6xl font-extrabold'>
          New Course
        </div>
        <div className='text-secondary-accent font-medium font-roboto'>
          Expand your teaching portfolio
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
        pos="col-start-3" 
        size="col-span-8" 
        variant="flex" 
        title={
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-2">
            <Layers className="text-primary-accent" size={24} />
            <h2 className="text-2xl font-bold font-outfit text-primary-accent">
              Course Details
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
          
          {/* Row 1: Code & Title */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
                <InputForm 
                label="Course Code" 
                name="courseCode" 
                value={formData.courseCode} 
                onChange={handleChange} 
                placeholder="e.g. CO2003" 
                icon={BookOpen}
                required 
                />
            </div>
            <div className="md:col-span-2">
                <InputForm 
                label="Course Title" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                placeholder="e.g. Advanced Software Engineering" 
                icon={Type}
                required 
                />
            </div>
          </div>

          {/* Row 2: Description (Custom Textarea matching InputForm styles) */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold font-outfit text-txt-primary uppercase tracking-wider">
              Description <span className="text-red-500">*</span>
            </label>
            <div className="group w-full flex items-start gap-3 py-3 px-4 rounded-xl border border-txt-dark transition-all duration-200 focus-within:ring-2 focus-within:ring-offset-2 focus-within:border-txt-placeholder focus-within:outline-none focus-within:ring-border bg-surface">
                <div className="text-txt-dark group-focus-within:text-txt-accent mt-1">
                    <AlignLeft size={20} />
                </div>
                <textarea
                    name="description"
                    rows="5"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe what students will learn in this course..."
                    required
                    className="w-full bg-transparent outline-none font-medium font-roboto text-txt-primary placeholder-txt-placeholder text-base resize-none"
                />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4 pt-4 border-t border-gray-100">
            <Button 
                type="submit" 
                isLoading={isLoading} 
                className="w-full md:w-auto md:px-12"
            >
              Publish Course
            </Button>
          </div>

        </form>
      </Tray>

      <div className='col-start-2 col-span-10 p-8'></div>
    </>
  );
};

export default CreateCourse;
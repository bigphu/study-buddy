import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Briefcase, GraduationCap } from 'lucide-react';
import InputSelect from '../components/InputSelect.jsx';
import Tray from '../components/Tray.jsx';
import Button from '../components/Button.jsx';
import InputForm from '../components/InputForm.jsx';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'Student', // Default
    academicStatus: 'Student', // Default
    bio: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // On success, redirect to login
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className='col-start-2 col-span-10 flex flex-col items-center justify-center min-h-[10vh] p-8 pb-0'>
        <div className='font-outfit text-primary-accent text-5xl font-extrabold'>
          Join Study Buddy
        </div>
        <div className='text-secondary-accent font-medium font-roboto mt-2'>
          Create an account to start your learning journey
        </div>
      </div>

      <Tray pos='col-start-3' size='col-span-8' className='mt-4 mb-10'>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-4 py-2">
          
          {error && (
            <div className="col-span-full bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-200">
              {error}
            </div>
          )}

          {/* Left Column */}
          <div className="flex flex-col gap-6">
            <InputForm
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              icon={User}
              required
            />
            
            <InputForm
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="johndoe123"
              icon={User}
              required
            />

            <InputForm
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              icon={Lock}
              required
            />
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            {/* Role Selection */}
            <InputSelect
              label="Role"
              name="role"
              value={formData.role}          // Controlled input: comes from state
              onChange={handleChange}        // The generic handler
              options={['Student', 'Tutor']} // The custom dropdown items
              icon={Briefcase}               // The Lucide icon component
            />

            {/* Academic Status Selection */}
            <InputSelect
              label="Academic Status"
              name="academicStatus"
              value={formData.academicStatus}
              onChange={handleChange}
              options={['Student', 'Bachelor', 'Master', 'PhD', 'Professor']}
              icon={GraduationCap}
            />
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold font-outfit text-txt-dark uppercase tracking-wider">Bio (Optional)</label>
              <textarea name="bio" rows="1" onChange={handleChange} className="input-std py-3" placeholder="Tell us about yourself..." />
            </div>
          </div>

          <div className="col-span-full flex flex-col gap-4 mt-4">
            <Button type="submit" isLoading={isSubmitting} className="w-full">
              Register Account
            </Button>
            <div className="text-center text-sm font-roboto text-txt-placeholder">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-accent font-bold hover:underline">Login here</Link>
            </div>
          </div>

        </form>
        
        {/* Helper Style for Inputs */}
        <style>{`
          .input-std {
            width: 100%;
            padding: 0.75rem;
            border-radius: 0.75rem;
            border: 1px solid #e5e7eb;
            background-color: #f9fafb;
            font-family: 'Roboto', sans-serif;
            color: #1f2937;
            transition: all 0.2s;
            outline: none;
          }
          .input-std:focus {
            background-color: white;
            border-color: #6366f1; /* primary-accent approx */
            box-shadow: 0 0 0 1px #6366f1;
          }
        `}</style>
      </Tray>

      <div className='col-start-2 col-span-10 p-8'></div>
    </>
  );
};

export default Register;

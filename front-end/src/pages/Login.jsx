import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Tray from '../components/Tray.jsx';
import Button from '../components/Button.jsx';
import Loading from '../components/Loading.jsx';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Replace with your actual API URL
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      login(data.token, data.user);
      navigate('/home');
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
          Welcome Back
        </div>
        <div className='text-secondary-accent font-medium font-roboto mt-2'>
          Please sign in to continue to your dashboard
        </div>
      </div>

      {/* Centered Tray */}
      <Tray pos='col-start-4' size='col-span-6' className='mt-4'>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full px-4 py-2">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-200">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold font-outfit text-txt-dark uppercase tracking-wider">
              Username
            </label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-accent focus:ring-1 focus:ring-primary-accent transition-all outline-none font-roboto text-txt-dark"
              placeholder="Enter your username"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold font-outfit text-txt-dark uppercase tracking-wider">
              Password
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-accent focus:ring-1 focus:ring-primary-accent transition-all outline-none font-roboto text-txt-dark"
              placeholder="••••••••"
            />
          </div>

          <div className="flex flex-col gap-4 mt-2">
            <Button 
              type="submit" 
              isLoading={isSubmitting} 
              className="w-full"
            >
              Sign In
            </Button>
            
            <div className="text-center text-sm font-roboto text-txt-placeholder">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-accent font-bold hover:underline">
                Register here
              </Link>
            </div>
          </div>

        </form>
      </Tray>

      <div className='col-start-2 col-span-10 p-8'></div>
    </>
  );
};

export default Login;
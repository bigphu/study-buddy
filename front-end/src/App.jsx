import { Route, Routes, Navigate, useLocation } from 'react-router-dom'; 
import './App.css';

import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar from '../src/components/Navbar.jsx';
import Footer from '../src/components/Footer.jsx';
import Background from '../src/components/Background.jsx';
import Loading from '../src/components/Loading.jsx';

import Home from '../src/pages/Home.jsx';
import Login from '../src/pages/Login.jsx';
import Register from '../src/pages/Register.jsx';
import Dashboard from '../src/pages/Dashboard.jsx';
import LinksCenter from '../src/pages/LinksCenter.jsx';
import Discovery from '../src/pages/Discovery.jsx';
import Profile from '../src/pages/Profile.jsx';
import MySessions from './pages/MySessions.jsx'; 
import Page404 from '../src/pages/Page404.jsx';
import CreateSession from './pages/CreateSession.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading fullScreen text="Verifying session..." />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return children;
};

const MainLayout = () => {
  return (
    <div className='min-h-[125vh] w-full flex flex-col relative'>
      <Navbar />
      <Background />
      <div className='grow w-full grid grid-cols-12 gap-8 auto-cols-max'>
        <Routes>
          <Route path='/' element={<Navigate to="/home" replace />} />
          <Route path='/home' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />

          {/* Protected Routes */}
          <Route path='/discovery' element={<ProtectedRoute><Discovery /></ProtectedRoute>} />
          <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          
          <Route path='/linkscenter' element={<ProtectedRoute><LinksCenter /></ProtectedRoute>} />
          <Route path='/mysessions/:courseCode' element={<ProtectedRoute><MySessions /></ProtectedRoute>} /> 
          <Route path="/create-session/:courseCode" element={<ProtectedRoute><CreateSession /></ProtectedRoute>} />

          <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path='/profile/:username' element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          <Route path='*' element={<Page404 />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
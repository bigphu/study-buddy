import { useState } from 'react'
import { Route, Routes, useLocation, Navigate } from 'react-router-dom'; // Added Navigate
import './App.css'

// --- COMPONENT IMPORTS ---
import Navbar from '../src/components/Navbar.jsx';
import Footer from '../src/components/Footer.jsx';
import Background from '../src/components/Background.jsx';

// --- PAGE IMPORTS ---
import Home from '../src/pages/Home.jsx';
import Dashboard from '../src/pages/Dashboard.jsx';
import LinksCenter from '../src/pages/LinksCenter.jsx';
import Discovery from '../src/pages/Discovery.jsx';
import Profile from '../src/pages/Profile.jsx';
import Page404 from '../src/pages/Page404.jsx';
// import Login from './pages/login/Login.jsx';
// import Register from './pages/register/Register.jsx';


function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='min-h-screen w-full'>
      <Navbar></Navbar>
      <Background></Background>

      <div className='grid grid-cols-12 gap-8 min-h-[90vh]'>
        <Routes>
          <Route path='/' element={<Navigate to="/home" replace />} />
          {/* 2. Restore the explicit Login route so 404s stop happening */}
          {/* <Route path='/login' element={<Login />} /> */}
              
          {/* <Route path='/register' element={<Register />} /> */}
              
          {/* Optional Home Route */}
          <Route path='/home' element={<Home />} />

          {/* --- PROTECTED ROUTES --- */}
          <Route path='/discovery' element={
            // <ProtectedRoute>
            <Discovery />
            // </ProtectedRoute>
          } />

          <Route path='/dashboard' element={
            // <ProtectedRoute>
            <Dashboard />
            // </ProtectedRoute>
          } />

          <Route path='/linkscenter' element={
            // <ProtectedRoute>
            <LinksCenter />
            // </ProtectedRoute>
          } />

          <Route path='/profile' element={
            // <ProtectedRoute>
            <Profile />
            // </ProtectedRoute>
          } />

              {/* catch-all */}
          <Route path='*' element={<Page404 />} />
        </Routes>
      </div>

      <Footer></Footer>
    </div>
  )
}

export default App

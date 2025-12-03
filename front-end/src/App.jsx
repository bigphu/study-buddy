import { useState } from 'react'
import { Route, Routes, useLocation, Navigate } from 'react-router-dom'; 
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

function App() {
  const [count, setCount] = useState(0)

  return (
    // CHANGE 1: Added 'flex flex-col' so children stack vertically
    <div className='min-h-[125vh] w-full flex flex-col relative'>
      <Navbar />
      <Background />

      {/* CHANGE 2: Added 'flex-grow' (or flex-1). This forces this div to eat up all available empty space, pushing the footer down. */}
      {/* Added 'w-full' to ensure grid takes full width */}
      <div className='grow w-full grid grid-cols-12 gap-8 auto-cols-max'>
        <Routes>
          <Route path='/' element={<Navigate to="/home" replace />} />
              
          <Route path='/home' element={<Home />} />

          {/* --- PROTECTED ROUTES --- */}
          <Route path='/discovery' element={<Discovery />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/linkscenter' element={<LinksCenter />} />
          <Route path='/profile' element={<Profile />} />

          {/* catch-all */}
          <Route path='*' element={<Page404 />} />
        </Routes>
      </div>

      <Footer />
    </div>
  )
}

export default App
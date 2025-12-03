import React from 'react'
import { useNavigate } from 'react-router-dom'

import miku404 from '../assets/page-404.jpg';

import Button from '../components/Button.jsx'
import Tray from '../components/Tray.jsx';

const Page404 = () => {
  const navigate = useNavigate();

  return (
    <>
      <Tray pos='col-start-5' size='col-span-4' className='self-center'>
        <div className='flex flex-col items-center gap-4 justify-center'>
          <img className='w-[80%]' src={miku404} ></img>

          <div className='text-txt-primary text-2xl font-bold mb-2'>
            Error 404: Page not found (T^T) 
          </div>

          <Button onClick={() => navigate('/home')}>Back to home</Button>
        </div>
      </Tray>
    </>
  )
}

export default Page404

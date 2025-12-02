import React from 'react'

import homeBackground from '../assets/home-background.png'

const Home = () => {
  return (
    <>
      <div className='col-start-3 col-span-3 flex flex-col items-start justify-center gap-4'>
        <div className='text-txt-primary text-8xl font-outfit font-extrabold'>
          TUTOT <br></br>
          SUPPORT <br></br>
          SYSTEM <br></br>
        </div>

        <div className='text-txt-accent font-roboto font-medium text-sm'>
          <span>
            Participate in an optimized digital peer tutoring and academic support program
          </span>
        </div>

      </div>

      <div className='col-start-7 col-span-6 flex flex-col items-start justify-center'>
        <img className='bg-cover w-full h-full' src={homeBackground}></img>
      </div>
    </>
  )
}

export default Home

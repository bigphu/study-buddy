import React from 'react'
import mikuFooter from '../assets/miku-footer.jpg'

const Footer = () => {
  return (
    // REMOVED: 'relative bottom-0 left-0 max-h-[10vh]'
    // KEPT: 'z-50' in case it needs to sit on top of the Background component
    <div className='w-full bg-primary flex justify-center items-center min-h-[10vh] z-50 py-4'>
      <p className='mr-2 text-txt-light font-outfit font-medium'>
        This website is developed by 
      </p>
      <a href='https://github.com/bigphu' target='_blank' rel='noreferrer'>
        <img
          src={mikuFooter}
          alt='Miku Footer'
          className='size-8 rounded-full border-2 border-secondary-accent'
        />
      </a>
    </div>
  )
}

export default Footer
import React from 'react'
import mikuFooter from '../assets/miku-footer.jpg'

const Footer = () => {
  return (
    <div className='relative bottom-0 left-0 z-50 min-h-[10vh] max-h-[10vh] w-full bg-primary flex justify-center items-center'>
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
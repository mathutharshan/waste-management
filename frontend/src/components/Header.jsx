import React from 'react'
import { assets } from '../assets/assets';

const header = () => {
  return (
    <div className='flex flex-col md:flex-row flex-wrap bg-primary rounded-lg px-6 md:px-10 lg:px-20'>
      {/*left side*/}
      <div className='md:w-1/2 flexflex-col items-start justify-center gap-4 py-10 m-auto md-:py-[10vw] md-mb-[-30px]'>
        <p className='text-3xl md:text-4xl lg:text-5xl text-white font-semibold leading-tight md:leading-tight lg:leading-tight'>
          Cleaning Areas <br /> For Your Future
        </p>
        <div className='flex flex-col md:flex-row items-center gap-3 text-white text-sm font-light'>
          <img className='w-28' src={assets.group_profiles} alt="" />
          <p>Streamlining garbage reporting, collection routes, <br className='hidden sm:block' /> and recycling recommendations for cleaner communities.</p>
        </div>
        <a href="SpecialityMenu"  className="flex items-center gap-2 bg-white px-9 py-3 rounded-full text-gray-600 text-sm m-auto md:m-0 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg">Report
           <img className='w-3' src={assets.arrow_icon} alt="" /></a>
      </div>
      {/*right side*/}
      <div className='md:w-1/2 relative'>
         <img className='w-full md:absolute bottom-0 h-auto rounded-lg'style={{ width: '50%', height: 'auto' }}  src={assets.header_img} alt="" />
      </div>
      
    </div>
  )
}

export default header


import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 text-gray-500'>
        <p>ABOUT <span className='text-gray-700 font-medium'>US</span></p>
      </div>
      <div className='my-10 flex flex-col md:flex-row gap-12'>
        <img className='w-full md:max-w-[360px] h-[450px]' src={assets.about_image} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600'>
          <p>Welcome to our innovative Waste Management System, designed to promote a cleaner and greener Sri Lanka. Our platform empowers communities to report roadside garbage, enabling quick and efficient disposal through optimized truck routes.</p>
          <p>With a strong focus on sustainability, the system leverages AI to detect garbage types from user-uploaded images and provides recycling recommendations to encourage proper waste segregation. Admins can efficiently allocate truck drivers and generate detailed reports for better waste analysis.</p>
          <b className='text-gray-800'>Our Vision</b>
          <p>Our vision is to foster a cleaner, sustainable Sri Lanka by leveraging AI-driven waste management, promoting recycling, optimizing garbage collection, and empowering citizens to contribute to a responsible, eco-conscious community.</p>
        </div>
      </div>
      <div className='tet-xl my-4'>
        <p>WHY <span className='text-gray-700 font-semibold'>CHOOSE US</span> </p>
      </div>
      <div className='flex flex-col md:flex-row mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>Efficiency:</b>
          <p>waste management ensures optimal resource utilization, reduces landfill waste, and promotes sustainable recycling for a cleaner environment.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
        <b>Convenience:</b>
        <p>Tailored solutions based on user-reported waste types ensure effective recommendations and optimized waste management strategies.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
        <b>Personalization:</b>
        <p>Simplified waste disposal processes empower communities to easily report, recycle, and manage waste responsibly.</p>
        </div>
      </div>
      
    </div>
  )
}

export default About

import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Drivers = () => {
  const { speciality } = useParams();
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter,setShowFilter] = useState(false)
  const navigate = useNavigate();
  const { drivers } = useContext(AppContext);

  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(drivers.filter(doc => doc.speciality === speciality));
    } else {
      setFilterDoc(drivers);
    }
  };

  useEffect(() => {
    applyFilter();
  }, [drivers, speciality]);

  return (
    <div>
      <p className='text-gray-600'>Browse through the speciality</p>
      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
        <button className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${showFilter ? 'bg-primary text-white' : ''}`} onClick={()=>setShowFilter(prev =>!prev)}>Filters</button>
        <div className={`flex-col gap-4 text-sm text-gray-600 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
          <p onClick={() => speciality === 'Recyclable' ? navigate('/drivers') : navigate('/drivers/Recyclable')} 
             className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Recyclable" ? "bg-indigo-100 text-black" : ""}`}>Recyclable</p>
          <p onClick={() => speciality === 'Electronic' ? navigate('/drivers') : navigate('/drivers/Electronic')} 
             className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Electronic" ? "bg-indigo-100 text-black" : ""}`}>Electronic</p>
          <p onClick={() => speciality === 'Bio-degradable' ? navigate('/drivers') : navigate('/drivers/Bio-degradable')} 
             className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Bio-degradable" ? "bg-indigo-100 text-black" : ""}`}>Bio-degradable</p>
          <p onClick={() => speciality === 'Construction' ? navigate('/drivers') : navigate('/drivers/Construction')} 
             className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Construction" ? "bg-indigo-100 text-black" : ""}`}>Construction</p>
          <p onClick={() => speciality === 'Plastic' ? navigate('/drivers') : navigate('/drivers/Plastic')} 
             className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Plastic" ? "bg-indigo-100 text-black" : ""}`}>Plastic</p>
          <p onClick={() => speciality === 'Garden' ? navigate('/drivers') : navigate('/drivers/Garden')} 
             className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Garden" ? "bg-indigo-100 text-black" : ""}`}>Garden</p>
        </div>
        <div className='w-full grid grid-cols-auto gap-4 gap-y-6'>
          {filterDoc.map((item, index) => (
            <div onClick={() => navigate(`/report/${item._id}`)} 
                 className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500' key={index}>
              <img className='bg-blue-50' src={item.image} alt="" />
              <div className='p-4'>
                <div className='flex item-center gap-2 text-sm text-center text-green-500'>
                  <p className='w-2 h-2 bg-green-500 rounded-full'></p><p>Available</p>
                </div>
                <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
                <p className='text-gray-600 text-sm'>{item.speciality}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Drivers;

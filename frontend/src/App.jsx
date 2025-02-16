import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Drivers from './pages/Drivers';
import Login from './pages/Login';
import About from './pages/About';
import Contact from './pages/Contact';
import MyProfile from './pages/MyProfile';
import MyReport from './pages/MyReport';
import Report from './pages/Report';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const App = () => {
  return (
    <div className='mx-4 sm:mx-[10%]'>
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/drivers' element={<Drivers/>}/>
        <Route path='/drivers/:speciality' element={<Drivers />}/>
        <Route path='/login' element={<Login />}/>
        <Route path='/about' element={<About />}/>
        <Route path='/contact' element={<Contact />}/>
        <Route path='/my-profile' element={<MyProfile />}/>
        <Route path='/my-report' element={<MyReport />}/>
        <Route path='/report/:docId' element={<Report />}/>
      </Routes>
      <Footer/>
    </div>
  )
}

export default App

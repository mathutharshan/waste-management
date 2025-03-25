import React, { useState, useContext } from 'react';
import { AdminContext } from '../context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
  const [state, setState] = useState('Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { setAToken, backendUrl } = useContext(AdminContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const url = state === 'Admin' ? '/api/admin/login' : '/api/driver/login';
      const { data } = await axios.post(backendUrl + url, { email, password });

      if (data.success) {
        localStorage.setItem('aToken', data.token);
        setAToken(data.token);
        toast.success('Login Successful!');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed! Please try again.');
    }
  };

  return (
    <form className='min-h-[80vh] flex items-center' onSubmit={onSubmitHandler}>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
        <p className='text-2xl font-semibold m-auto'>
          <span className='text-primary'> {state} </span> Login
        </p>
        <div className='w-full'>
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className='border border-[#DADADA] rounded w-full p-2 mt-1'
            type='email'
            required
          />
        </div>
        <div className='w-full'>
          <p>Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className='border border-[#DADADA] rounded w-full p-2 mt-1'
            type='password'
            required
          />
        </div>
        <button type='submit' className='bg-primary text-white w-full py-2 rounded-md text-base'>
          Login
        </button>
        {state === 'Admin' ? (
          <p>
            Driver Login?{' '}
            <span className='text-primary underline cursor-pointer' onClick={() => setState('Driver')}>
              Click Here
            </span>
          </p>
        ) : (
          <p>
            Admin Login?{' '}
            <span className='text-primary underline cursor-pointer' onClick={() => setState('Admin')}>
              Click Here
            </span>
          </p>
        )}
      </div>
    </form> 
  );
};

export default Login;

import React, { useState,useEffect } from 'react';
import '../../assets/styles/login.css';
import logo from '../../assets/images/thick.png';
import {  useNavigate } from 'react-router-dom';
import { setAdmin } from '../../redux/slices/adminSlice';
import { useDispatch, useSelector } from 'react-redux';
import '../../assets/styles/login.css'
import { Button,TextField } from '@mui/material';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default  function Admin() {
  const[username,setUsername]=useState('')
  const[password,setPassword]=useState('')
  const navigate=useNavigate()
  const dispatch=useDispatch()
  const {token}=useSelector((state)=>state.admin)
  useEffect(() => {
 
    if (token) {
        navigate('/admin/dashboard'); 
    }
}, [token,navigate]);

  const handleLogin=async(e)=>{
    e.preventDefault()
    try {
      const response=await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/login`,{
        username,
        password
      })
      if(response.data.success){
        const {token}=response.data
        dispatch(setAdmin({token}))
        toast.success('Login successfull')
        setTimeout(() => {
          navigate('/admin/dashboard')
        }, 1000);
      }
    } catch (error) {
      toast.error('Invalid admin credentials');
    }
  
  }
  return (
    <div className="container my-5 " style={{maxWidth:'434px'}}>
     
      <div className="text-center mb-2">
      <img src={logo} alt="Logo" className="img-fluid mb-2 text-center" style={{ maxWidth: '70px',marginLeft:'0rem' }} />
       
        <h5 className="headI text-center mb-5">ADMIN LOGIN </h5>
         </div>

      <div className="row align-items-start justify-content-between">
        <div className="col-12 col-lg-12 p-3 m-3">
          <form className='formii mb-5' >
           <label htmlFor="email"
             className="mb-3">
              USERNAME
            </label>
            <TextField placeholder="username"
                variant="standard" 
                value={username}
           onChange={(e)=>setUsername(e.target.value)}
           className="text mb-3" fullWidth
            required
             />
            <label htmlFor="password"
             className="mb-3">
              PASSWORD
            </label>
            <TextField placeholder="password"
                  type='password'
                 variant="standard" className="text mb-3" fullWidth
                 value={password}
                 onChange={(e)=>setPassword(e.target.value)}
              />
          
          
            <Button variant="contained" type='submit' fullWidth onClick={handleLogin} className="button ">
            LOGIN
            </Button>
          </form>
        
        </div>

       
       
      </div>
      <ToastContainer/>
    </div>
  );
}

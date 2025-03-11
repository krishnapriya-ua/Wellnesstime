import React,{useState} from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Import Bootstrap Icons
import '../../assets/styles/login.css';
import { Button, TextField,CircularProgress} from '@mui/material';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false); 
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true)
  
   
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/userroute/forgotpassword`, { email });
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send email.');
    }finally{
      setLoading(false)
    }
  };
  return (
    <div className="container my-5 ">
      <div className="back d-flex mb-3 align-items-start justify-content-between">
        <Link style={{ color: '#000000ab',textDecoration:'none',fontSize:'small' }} to="/">
          <p>BACK</p>
        </Link>
        <Link style={{ color: '#000000ab',fontSize:'small',textDecoration:'none' }} to="/login">
          <p>LOGIN</p>
        </Link>
      </div>

      <div className="text-center mb-2">
      
        <h5 className="headI text-center mb-3">FORGOT PASSWORD </h5>
        <p className='text-center p-1' style={{justifySelf:'center',color:'#000000b8'}}>Enter your account’s email and we’ll send  <br/> you an email to reset the password.</p>
      </div>

      <div className="row align-items-start justify-content-between">
        <div className="col-12 col-lg-12 p-3 m-3">
          <form className='formii' onSubmit={handleForgotPassword}>
           <label htmlFor="email"
             className="mb-3">
              EMAIL
            </label>
            <TextField placeholder="name@gmail.com"
              value={email}
                onChange={(e) => setEmail(e.target.value.trim())} 
                 variant="standard" className="text mb-3" fullWidth />
          
          
            <Button variant="contained" disabled={loading} type='submit' fullWidth className="button mb-3">
            {loading ?
             (
               <CircularProgress size={24} style={{ color: 'white' }} /> // Show spinner
             ) : (
               'SEND MAIL'
               )}
            </Button>
          </form>
        
        </div>

       
       
      </div>
      <ToastContainer/>
    </div>
  );
}

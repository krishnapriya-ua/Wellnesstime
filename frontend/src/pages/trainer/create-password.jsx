import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { TextField } from '@mui/material';
import logo from '../../assets/images/thick.png'

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
export default function CreatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [email, setEmail] = useState('');
  const [showPassword,setShowPassword]=useState(false)
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); 
  const navigate=useNavigate()
 
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/trainer/verify-token`, { token });
        if (response.data.success) {
          setIsTokenValid(true);
          setEmail(response.data.email); 
        } else {
          toast.error(response.data.message || 'Invalid or expired token.');
        }
      } catch (error) {
        toast.error('An error occurred while verifying the token.');
      }
    };

    verifyToken();
  }, [token]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if(!password||!confirmPassword){
        toast.error('All fields are necessary')
        return
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/trainer/create-password`, {
        token,
        password,
      });
      if (response.data.success) {
        toast.success('Password created successfully! You can now log in.');
        setTimeout(() => {
            navigate('/trainer/login')
        }, 2000);
      } else {
        toast.error(response.data.message || 'Failed to create password.');
      }
    } catch (error) {
      toast.error('An error occurred while creating the password.');
    }
  };

  if (!isTokenValid) {
    return <h5>Invalid or expired link. Please request a new one.</h5>;
  }
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
    <div style={{ maxWidth: '380px', margin: 'auto',
        width: "100%",
        padding: "20px",
       
       }}>
        <ToastContainer/>
        <div className="text-center mb-2">
      <img src={logo} alt="Logo" className="img-fluid mb-2 text-center" style={{ maxWidth: '70px',marginLeft:'0rem' }} />
       
        <h6 className="headI text-center mb-5">CREATE PASSWORD</h6>
         </div>

      <form onSubmit={handleSubmit} noValidate style={{alignItems:'center',justifyContent:'center'}}>
        <div className='position-relative' style={{marginBottom:'22px'}}>
          <label>Password:</label> 
          <div style={{display:'flex'}}>
          <TextField
            type={showPassword?"text":"password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            variant='standard'
          
            fullWidth
           
          />
           <i
            style={{marginLeft:'-2rem',marginTop:'-18px'}}
              className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} password-toggle`}
              onClick={togglePasswordVisibility}
            role="button"
              aria-label="Toggle password visibility"
            ></i>
          </div>
         
          
        </div>
        <div className='position-relative'>
          <label>Confirm Password:</label> 
          <div style={{display:'flex'}}>
          <TextField
          type={showPassword?"text":"password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            variant='standard'
            className='mb-4'
            fullWidth
            
          />
          
          </div>
         
        </div>
        <button className='mb-4' type="submit" style={{ padding: '10px 20px', background: 'black',fontSize:'small', color: '#fff', border: 'none', borderRadius: '5px',width:'100%' }}>
          SUBMIT
        </button>
      </form>
    </div>
    </div>
  );
}

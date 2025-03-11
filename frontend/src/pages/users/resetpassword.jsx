import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom'; // For getting token from the URL
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, TextField } from '@mui/material';
import { Link } from 'react-router-dom';
import '../../assets/styles/signup.css'
export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token'); // Extract token from URL
    const navigate=useNavigate()
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords don't match!");
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/userroute/resetpassword`, { token, password });
            toast.success(response.data.message);
            setTimeout(() => {
                navigate('/login')
            }, 2000);
           

        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password.');
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
      
        <h5 className="headI text-center mb-5">RESET PASSWORD </h5>
           </div>

      <div className="row align-items-start justify-content-between">
        <div className="col-12 col-lg-12 p-3 m-3">
        <form className='formii' onSubmit={handleResetPassword}>
                <TextField
                    type="password"
                    label="New Password"
                    variant="outlined"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mb-3"
                />
                <TextField
                    type="password"
                    label="Confirm Password"
                    variant="outlined"
                    fullWidth
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mb-3"
                />
                <Button style={{background:'black'}} type="submit" variant="contained" fullWidth>
                    Reset Password
                </Button>
            </form>
        </div>

       
       
      </div>
      <ToastContainer/>
    </div>
    );
}

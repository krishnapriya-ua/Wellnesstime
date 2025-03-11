import React, { useState } from "react";
import "../../assets/styles/loginmodal.css";
import popup from '../../assets/images/weight.jpg';
import { TextField, Button } from "@mui/material";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setUser,setBlocked } from "../../redux/slices/userSlice"; // Adjust if using different action types
export function LoginModal({ isOpen, onClose }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
  
    // Do not render if the modal is not open
    if (!isOpen) return null;
  
  
    const handleLogin = async (e) => {
      e.preventDefault();
      if (!email || !password) {
        toast.error('All fields are necessary');
        return;
      }
      try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/userroute/login`, { email, password });
        if (response.data.success) {
          const { firstname, email, token, userId, blocked } = response.data;
          if (blocked) {
            dispatch(setBlocked(true));
            toast.error(response.data.message);
            return;
          }
          dispatch(setUser({ firstname, email, token, userId, blocked }));
         
            toast.success('Login successful');
        
         
          setTimeout(() => {
            onClose(); // Close the modal after a short delay if needed
          }, 1000);// Close the modal after successful login
        } else {
          toast.error(response?.data?.message || 'Login failed');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'An error occurred');
      }
    };
  
    return (
      <div className="modal-overlay">
        <div className="modall-content" style={{maxWidth:'561px'}}>
          <div className="modal-left">
            <img
              style={{ marginLeft: '0rem', padding: '33px' }}
              src={popup}
              alt="Workout"
              className="modal-image"
            />
          </div>
          <div className="modal-right">
            <h6 className="headp mb-3" style={{ marginLeft: '0rem' }}>PLEASE LOGIN</h6>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <TextField
                  className="mb-2"
                  type="email"
                  variant="standard"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <TextField
                  className="mb-4"
                 type="password"
                  variant="standard"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="login-button mt-0 mb-3">
                Login
              </Button>
              <Link to="/forgotpassword" style={{ color: 'black' }}>
                <p className="forgotpassword">Forgot password?</p>
              </Link>
              <Link to="/signup" style={{ color: 'black' }}>
                <p className="forgotpassword">Don't have an account?</p>
              </Link>
            </form>
          </div>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <ToastContainer />
      </div>
    );
  }
  
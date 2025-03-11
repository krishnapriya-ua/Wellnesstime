import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { ToastContainer, toast } from 'react-toastify';
import { Button, TextField,CircularProgress } from "@mui/material";
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import '../../assets/styles/signup.css'
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser,setBlocked } from "../../redux/slices/userSlice";

export default function Signup() {
  const phoneInputRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch=useDispatch()
  const navigate=useNavigate()
  useEffect(() => {
    if (phoneInputRef.current) {
      const iti = window.intlTelInput(phoneInputRef.current, {
        initialCountry: "in",
        separateDialCode: true,
        utilsScript:
          "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
      });

      return () => iti.destroy();
    }
  }, []);

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
  
    // Validate required fields
    if (!firstname || !lastname || !email || !password || !confirmPassword) {
      toast.error("All fields are required.");
      setLoading(false)
      return;
    }
    if (firstname.trim().length < 3) {
      toast.error('First name must have at least 3 characters');
      setLoading(false)
      return;
    }
  
    // Validate email format
    if (!validateEmail(email)) {
      toast.error("Invalid email format.");
      setLoading(false)
      return;
    }
  
    if (password !== confirmPassword) {
      toast.error("Passwords must match.");
      setLoading(false)
      return;
    }
  
    const phoneInput = phoneInputRef.current;
    const intlInputInstance = window.intlTelInputGlobals.getInstance(phoneInput);
  
    if (intlInputInstance) {
      const fullNumber = intlInputInstance.getNumber();
      const isValid = intlInputInstance.isValidNumber();
  
      if (!isValid) {
        toast.error("Invalid phone number. Please try again.");
        setLoading(false)
        return;
      }
  
      // Send data to backend
      try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/userroute/signup`, {
          firstname: firstname.trim(),
          lastname: lastname.trim(),
          email,
          phonenumber: fullNumber,
          password,
        });
  
        if (response.data.success) {
          // Navigate to OTP page after successful signup (no user data in Redux yet)
          navigate('/otp', { state: { email } });
        } else {
          toast.error(response.data.message || "Signup failed.");
          setLoading(false)
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Signup failed, please try again later');
        setLoading(false)
      }
    } else {
      toast.error("Phone input instance could not be initialized.");
      setLoading(false)
    }
  };
  
  
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="container my-5">
      <div className="back d-flex mb-3 align-items-start justify-content-between">
        <Link style={{ color: "#000000ab", textDecoration: "none", fontSize: "small" }} to="/">
          <p>BACK</p>
        </Link>
        <Link style={{ color: "#000000ab", fontSize: "small", textDecoration: "none" }} to="/login">
          <p>LOGIN</p>
        </Link>
      </div>

      <div className="text-center mb-2">
        <h5 className="headI text-center">CREATE YOUR ACCOUNT</h5>
      </div>

      <div className="row align-items-start justify-content-between">
        <div className="col-12 col-lg-12 p-3 m-3">
          <form className="formi" onSubmit={handleSubmit} noValidate>
            <label htmlFor="firstname" className="mb-3">FIRST NAME</label>
            <TextField
              placeholder="First Name"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              variant="standard"
              className="text mb-3"
              fullWidth
              required
            />

            <label htmlFor="lastname" className="mb-3">LAST NAME</label>
            <TextField
              placeholder="Last Name"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              variant="standard"
              className="text mb-3"
              fullWidth
              required
            />

            <label htmlFor="email" className="mb-3">EMAIL</label>
            <TextField
              placeholder="name@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="standard"
              className="text mb-3"
              fullWidth
              required
            />

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="phone" className="mb-3">PHONE NUMBER</label>
              <input
                id="phone"
                type="tel"
                ref={phoneInputRef}
                className="custom-input"
                placeholder="Phone number"
                style={{
                  width: '100%',
                  border: 'none',
                  borderBottom: '1px solid #ccc',
                  outline: 'none',
                  padding: '8px 0',
                  fontSize: '16px',
                  background: 'transparent'
                }}
                required
              />
            </div>

            {/* Password Fields */}
            <div className="mb-3 position-relative">
              <label htmlFor="password" className="form-label">PASSWORD</label>
              <TextField
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                placeholder="Password"
                variant="standard"
                className="form-control"
                required
              />
              <i
                className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} password-toggle`}
                onClick={togglePasswordVisibility}
                role="button"
                aria-label="Toggle password visibility"
              ></i>
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">CONFIRM PASSWORD</label>
              <TextField
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                variant="standard"
                className="form-control"
                required
              />
            </div>

            <Button variant="contained" disabled={loading} type="submit" fullWidth className="button mb-3">
            {loading ? <CircularProgress size={24} style={{color:'white'}}  /> : 'SIGN UP'}
            </Button>
          </form>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

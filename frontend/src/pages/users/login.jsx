import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, setBlocked } from '../../redux/slices/userSlice';
import google from '../../assets/images/google.png';
import link from '../../assets/images/link.png';
import logo from '../../assets/images/thick.png';
import '../../assets/styles/login.css';
//import LinkedInPage from './linkedin';
// Import Google OAuth provider from 'react-oauth/google'
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { blocked } = useSelector((state) => state.user);
  

  useEffect(() => {
    if (blocked) {
      toast.error('Sorry, This account is blocked');
    }
  }, [blocked]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('All fields are necessary');
      return;
    }
    if(email.trim()===''){
      toast.error('Email should not have empty spaces')
      return
    }
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/userroute/login`, { email, password });
      if (response.data.success) {
        const { firstname, email, token, userId, blocked,lastname } = response.data;
        if (blocked) {
          dispatch(setBlocked(true));
          toast.error(response.data.message);
          return;
        }
        dispatch(setUser({ firstname, email, token, userId, blocked,lastname }));

        toast.success('Login successful');
        const redirectUrl = localStorage.getItem('redirectUrl');
  
        if (redirectUrl) {
          // Redirect to the saved URL
          navigate(redirectUrl);
          // Optionally, clear the saved URL after redirect
          localStorage.removeItem('redirectUrl');
        }else{
          setTimeout(() => {
            navigate('/');
          }, 1000);
        }
       
       
      } else {
        toast.error(response?.data?.message || 'Sorry your account is blocked');
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };
  const handleGoogleLoginSuccess = async (response) => {
    try {
      const googleToken = response.credential;
      const googleResponse = await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/auth/google/callback`, {
        token: googleToken,
      });
  
      console.log("Google Response:", googleResponse.data); // Check the response
  
      const { email, token, blocked,  name,user,phonenumber } = googleResponse.data;
      const userId=user._id||user.googleId;
       dispatch(setUser({ firstname:user.firstname, email:user.email,lastname:user.lastname, token, userId,phonenumber:user.phonenumber,blocked: user.blocked, name }));
      console.log(userId,'google userid')
      console.log(user.firstname,'firstname')
    
      if (blocked) {
        dispatch(setBlocked(true));
        toast.error('blocked');
       
        navigate('/login')
        return;
      }
      const redirectUrl = localStorage.getItem('redirectUrl');
  
        if (redirectUrl) {
          // Redirect to the saved URL
          navigate(redirectUrl);
          // Optionally, clear the saved URL after redirect
          localStorage.removeItem('redirectUrl');
        }
        else{
          toast.success('Google login successful');
          navigate('/');
        }
      
     
    
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  const handleLinkedLogin = async () => {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: '78dpb7kn9515ff',
      redirect_uri: process.env.REACT_APP_LINKEDIN_REDIRECT_URI,
      scope: 'openid email profile',
    });
    window.location.href = `https://www.linkedin.com/oauth/v2/authorization?${params}`;
  };
  
  
  useEffect(() => {
    console.log('useEffect triggered');
    console.log('Current URL:', window.location.href);

    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code'); 
    console.log('Received Code:', code);// The 'code' LinkedIn sends back

    if (code) {
      // Send the code to your backend to get the token and user data
      axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/auth/linkedin/callback`, { code })
        .then(response => {
          console.log('LinkedIn Login Successful:', response.data);
          const { email, token, blocked, picture, name, user } = response.data;
          const userId = user._id || user.linkedinId;

          // Dispatch the user information to your redux store
          dispatch(setUser({ firstname: user.firstname, email: user.email, lastname: user.lastname, token, userId, blocked: user.blocked, picture, name }));

          // Check if the user is blocked
          if (blocked) {
            dispatch(setBlocked(true));
            toast.error('Your account is blocked');
            navigate('/login');
            return;
          }

          // Handle successful login
          toast.success('LinkedIn login successful');
          navigate('/'); // Redirect to the home page after login
        })
        .catch(error => {
          console.error('Error during LinkedIn login:', error);
          toast.error(error.response?.data?.message || 'Error logging in');
          navigate('/login');
        });
    }
  }, [dispatch, navigate]);


 

  return (
    <div className="container my-5">
      <div className="back d-flex mb-0 align-items-start justify-content-between">
        <Link style={{ color: '#000000ab', textDecoration: 'none', fontSize: 'small' }} to="/">
          <p>BACK</p>
        </Link>
       
      </div>

      <div className="text-center mb-4">
        <img src={logo} alt="Logo" className="img-fluid mb-2" style={{ maxWidth: '80px' }} />
        <h5 className="head text-center">LOG INTO WELLNESS TIME</h5>
      </div>

      <div className="row align-items-start justify-content-between">
        <div className="col-12 col-lg-6 p-4">
          <form style={{ width: '90%' }} onSubmit={handleLogin} noValidate>
            <label htmlFor="email" className="mb-3">EMAIL</label>
            <TextField
              placeholder="name@gmail.com"
              variant="standard"
              className="text mb-3"
              fullWidth
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="mb-3 position-relative">
              <label htmlFor="password" className="form-label">PASSWORD</label>
              <TextField
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="form-control"
                placeholder="password"
                variant="standard"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              <i
                className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} password-toggle`}
                onClick={togglePasswordVisibility}
                role="button"
                aria-label="Toggle password visibility"
                tabIndex="0"
              ></i>
            </div>
            <Button variant="contained" fullWidth className="button mb-3" type="submit">
              Log In
            </Button>
          </form>
          <div className='d-flex'>
          <p className="cant text-start mb-0"  style={{ color: '#000000ab', fontSize: 'small',fontWeight:'500', textDecoration: 'none',whiteSpace:'nowrap' }}>
            <Link to="/forgotpassword" className="text-decoration-none"> FORGOT PASSWORD ?</Link>
          </p>
          <Link className='canti' style={{ color: '#000000ab', fontSize: 'small',fontWeight:'500', textDecoration: 'none',marginLeft:'2rem' }} to="/signup">
          <p>DON'T HAVE AN ACCOUNT?</p>
        </Link>
          </div>
         
        </div>
        <div className="d-none d-lg-block col-1 text-center">
          <div className="vr"></div>
        </div>
        <div className="social col-12 col-lg-5 p-4">
          <p className="text-center mb-3">OR</p>

          {/* Google Login Button */}
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={() => toast.error('Google login failed')}
           
          >
            <Button >
              <img src={google} style={{ maxWidth: '18px', marginLeft: 'unset' }} alt="Google logo" />
              Continue with Google
            </Button>
          </GoogleLogin>

          {/* <Button  onClick={handleLinkedLogin} style={{marginTop:'16px'}} className="btn btn-outline-secondary w-100 mb-2" variant="outlined">
            <img src={link} style={{ maxWidth: '20px', marginLeft: 'unset' }} alt="LinkedIn logo" />
            Continue with LinkedIn
          </Button> */}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

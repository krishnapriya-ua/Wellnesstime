import React, { useState,useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import { TextField } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setTrainer } from "../../redux/slices/trainerSlice";
import logo from '../../assets/images/thick.png'

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch=useDispatch()
  const[showpassword,setShowPassword]=useState(false)

  const {token}=useSelector((state)=>state.trainer)

    useEffect(() => {
   
      if (token) {
          navigate('/trainer/dashboard'); 
      }
  }, [token,navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if(!email||!password){
        toast.error('All feilds are necessary')
        return
    }
    if(email.trim()===''){
        toast.error('Email should not have empty spaces')
        return
    }
    const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
    if(!isValidEmail){
        toast.error('Invalid email format')
        return
    }
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/trainer/login`, {
        email,
        password,
      });
      
      if (response.data.success) {
        const {token,trainer}=response.data
        dispatch(setTrainer({
            trainerId:trainer.id,
            name:trainer.name,
            email:trainer.email,
            phonenumber:trainer.phonenumber,
            token
        }))
        toast.success("Login successful!");
       setTimeout(() => {
        navigate("/trainer/dashboard");
       }, 2000);
        
      } else {
        toast.error(response.data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Invalid credetials");
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
    <ToastContainer/>
      <form noValidate
        onSubmit={handleLogin}
        style={{
          maxWidth: "370px",
          width: "100%",
         
          
         
        }}
      >
        <div className="text-center mb-2">
        <img src={logo} alt="Logo" className="img-fluid mb-2 text-center" style={{ maxWidth: '70px',marginLeft:'0rem' }} />
       
        <h5 className="headI text-center mb-5">TRAINER LOGIN </h5>
         </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{fontSize:'small'}} htmlFor="email">EMAIL</label> <br />
          <TextField
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
           variant="standard"
           fullWidth
           placeholder="Email"
            required
          />
        </div>
        <div style={{ marginBottom: "20px" }} className="position-relative">
          <label style={{fontSize:'small'}} htmlFor="password">PASSWORD</label> <br />
          <div style={{display:'flex'}}>
          <TextField
          
          type={showpassword?'text':"password"}
          id="password"
          variant="standard"
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
         fullWidth
          required
        />
         <i
            style={{marginLeft:'-2rem',marginTop:'1px',zIndex:9999}}
              className={`bi ${showpassword ? "bi-eye-slash" : "bi-eye"} password-toggle`}
              onClick={togglePasswordVisibility}
            role="button"
              aria-label="Toggle password visibility"
            ></i>
          </div>
          
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            backgroundColor: "black",
            color: "white",
            border: "none",
            height:'37px',
            borderRadius: "5px",
            cursor: "pointer",
            fontSize:'small'
          }}
        >
          LOGIN
        </button>
      </form>
    </div>
  );
}

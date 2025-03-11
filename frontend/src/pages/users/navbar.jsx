import React, { useState,useEffect } from 'react';
import axios from 'axios';
import logo from '../../assets/images/logo.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../assets/styles/navbar.css';
import { Link } from 'react-router-dom';
import { useSelector,useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/userSlice';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide } from '@mui/material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function Navbar() {
  const[open,setOpen]=useState(false)
    const dispatch=useDispatch()
    const[ispremium,setIsPremium]=useState(false)
    const{firstname,isAuthenticated,premium,userId}=useSelector((state)=>state.user)
   
    const handlelogoutModal=()=>setOpen(true)
    const handleClose=()=>setOpen(false)
    const handlelogout=()=>{
        dispatch(logout())
        setOpen(false)
    
    }


     useEffect(()=>{
        const verifyPremium=async()=>{
            try {
                const response=await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/userroute/getpremium`)
                const premiumusers=response.data
    
                const currentuser=premiumusers.find((user)=>user._id===userId)
                if(currentuser){
                    setIsPremium(true)
    
                }
                else{
                    setIsPremium(false)
                }
            } catch (error) {
                console.log(error)
               
            }
        }
        verifyPremium()
       },[userId])
    return (
      <>
        <nav className="navbar navbar-expand-md navbar-light">
            <div className="containerl">
                <div className="wait">
                <Link className="navbar-brand" to="/">
                    <img src={logo} alt="logo" className="logo" />
                </Link>
                
                {/* Toggler button on the right */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                </div>
                {/* Logo on the left */}
              
                
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">HOME</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/about">ABOUT</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/blogs">BLOGS</Link>
                        </li>
                        {isAuthenticated?(
                             <>
                             <li className="nav-item">
                               <Link to={ispremium?'/premium-userprofile':'/userprofile'} className="nav-link" style={{whiteSpace:'nowrap',textTransform:'uppercase'}} >HEY {firstname}</Link>
                             </li>
                             <li className="nav-item">
                               <button
                                 className="nav-link"
                                 onClick={handlelogoutModal}
                                 style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                               >
                                 LOGOUT
                               </button>
                             </li>
                           </>
                         ) : (
                           <li className="nav-item">
                             <Link className="nav-link" to="/login">LOGIN</Link>
                           </li>
                         )}
                        
                       
                    </ul>
                </div>
            </div>
        </nav>
        <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Confirm Logout"}</DialogTitle>
        <DialogContent>
         
          <DialogContentText id="alert-dialog-slide-description">
            Are you sure you want to log out? You will need to log in again to access your account.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} className='navbut'>
            Cancel
          </Button>
          <Button onClick={handlelogout} className='navbut' >
            Logout
          </Button>
        </DialogActions>
      </Dialog>

        </>
    );
}

import React from 'react'
import '../../assets/styles/error.css'
import { Link } from 'react-router-dom';
import { Navbar } from './navbar';
import error from '../../assets/images/error1.jpg'
export default function Forbiddenpage() {
    return (
        <div >
         <Navbar/>
         <div className='error mt-5' style={{display:'flex',flexDirection:'row'}}>
          <div className="col-md-6">
          <div className='errcol' style={{textAlign: 'start',marginLeft:'8rem',marginTop:'6rem',marginBottom:'21rem'}} >
          <p className='mb-5' style={{ fontSize: '33px', color: 'black',fontWeight:'600' }}>
          PAGE NOT FOUND        </p>
           <p style={{ fontSize: '18px',width:'77%'}}>We're sorry. The Web address you entered is not a functioning page on our site
           </p>
          <Link to="/" style={{ fontSize: '18px', color: 'black', textDecoration: 'none' }}>
            Go to Wellness Time's <span style={{textDecoration:'underline',color:'black',cursor:'pointer'}}>Home page</span> 
          </Link>
          </div>
          </div>
          <div className="col-md-6">
            <img className='errimg' src={error} style={{maxWidth:'500px'}} alt="" srcset="" />
          </div>
         </div>
         
        </div>
      );
}

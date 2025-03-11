import React from 'react'
import logo from '../../assets/images/logo.png'
import { Link } from 'react-router-dom'
import '../../assets/styles/footer.css'

export default function Footer() {
  return (
    <div style={{overflowX:'hidden'}}>
         <div className="foot row" >
                <div className=" col-md-3 col-3">
                    <div className="footer">
                    <Link className="navbar-brand" to="/">
                    <img  style={{width:'90%'}} src={logo} alt="logo" className="logo" />
                   
                </Link>
                    </div>
                    </div>

                     <div className=" col-md-3 col-3 mt-5">
                        <p>stay connected</p>
                        <p>Facebook</p>
                        <p>Instagram</p>
                        <p>Twitter</p>

                     </div>
                     <div className=" col-md-3 col-3 mt-5">
                        <p>Quick links</p>
                        <p>About us</p>
                        <p>Contact us</p>
                        <p>Privacy policy</p>
                     </div>
                     <div className=" col-md-3 col-3 mt-5">
                        <p>TWT fitness</p>
                        <p>TWT franchise</p>
                        <p>TWT partnership</p>
                        <p>TWT network</p>
                     </div>
               <div className='col-md-12 col-12' style={{marginLeft:'4rem',marginBottom:'2rem'}} >© 2024 The Wellness Time . All rights reserved.</div>
                </div>
               
    </div>
  )
}

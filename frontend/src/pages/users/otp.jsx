import React, {useState} from 'react';
import {Button, Snackbar} from '@mui/material';
import axios from 'axios';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {useLocation, useNavigate} from 'react-router-dom';
import {setUser} from '../../redux/slices/userSlice';
import {useDispatch} from 'react-redux';
import logo from '../../assets/images/thick.png'
import {Link} from 'react-router-dom';

export default function OTPVerification() {
    const navigate = useNavigate()
    const location = useLocation();
    const email = location.state
        ?.email;
    const dispatch = useDispatch()
    const [otp, setOtp] = useState(Array(6).fill(''));
    const [errorMessage, setErrorMessage] = useState('');

    if (!email) {
        toast.error('no email provided')
        return
    }

    const handleInputChange=(value,index)=>{
      if(isNaN(value)) return
      const newOtp=[...otp]
      newOtp[index]=value
      setOtp(newOtp)

      if(value&&index<5){
        document.getElementById(`otp-input-${index+1}`).focus()
      }

    }

    const handleKeypress=(event,index)=>{
      if(event.key==='Backspace'&&!otp[index]&&index>0){
        document.getElementById(`otp-input-${index-1}`).focus()
      }
      else if(event.key==='Enter'){
        handleVerifyOTP()
      }

    }

    const handleVerifyOTP = async () => {
        try {
          const otpValue=otp.join('')
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_ROUTE}/userroute/verify-otp`,
                {email, otp:otpValue}
            );
            if (response.data.success) {
                const {firstname, email, token, userId, phonenumber,lastname} = response.data;
                
                dispatch(setUser({firstname, email, token, userId, phonenumber,lastname}));
                toast.success('Signup successfull!!')
                setTimeout(() => {
                    navigate('/');
                }, 2000);

            }
        } catch (error) {
            setErrorMessage('Invalid or expired OTP');
        }
    };
    const handlePaste = (event) => {
        const pastedValue = event.clipboardData.getData('Text').replace(/\D/g, ''); // Only allow numbers
        if (pastedValue.length === 6) {
          setOtp(pastedValue.split(''));
        }
        event.preventDefault();
      };
    
    return (
        <div className="container my-5">
            <div className="back d-flex mb-0 align-items-start justify-content-between">
                <Link
                    style={{
                        color: '#000000ab',
                        textDecoration: 'none',
                        fontSize: 'small'
                    }}
                    to="/signup">
                    <p>BACK</p>
                </Link>

            </div>

            <div className="text-center mb-1">
                <img
                    src={logo}
                    alt="Logo"
                    className="img-fluid mb-2"
                    style={{
                        maxWidth: '80px'
                    }}/>
                <p className="head text-center">An OTP has send to your mail please verify before 10 minutes.</p>
            </div>

            <div className='d-flex justify-content-center mt-5'>
              {otp.map((digit,index)=>(
                <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                maxLength='1'
                value={digit}
                onChange={(e)=>handleInputChange(e.target.value,index)}
                onKeyDown={(e)=>handleKeypress(e,index)} 
                onPaste={handlePaste} 
                style={{
                  width:'40px',
                  height:'40px',
                  margin:'0 5px',
                  textAlign:'center',
                  fontSize:'16px',
                  border:'1px solid black',
                  borderRadius:'5px'
                }}/>
              ))}
              </div>
              <div className='text-center mt-4'>
               
                <Button
                    style={{
                        backgroundColor: 'black',
                        color: 'white',
                        width: '40%'
                    }}
                    onClick={handleVerifyOTP}>Verify OTP</Button>

            </div>

            <Snackbar
                open={errorMessage !== ''}
                autoHideDuration={6000}
                message={errorMessage}
                onClose={() => setErrorMessage('')}/>
            <ToastContainer/>
        </div>

    );
}

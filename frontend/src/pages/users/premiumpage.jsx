import '../../assets/styles/premium.css';
import { Navbar } from './navbar';
import { useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setPremium } from '../../redux/slices/userSlice';
import axios from 'axios';
import { Box } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import call from '../../assets/images/call.jpg'
import tree from '../../assets/images/tree.jpg'
import nutrition from '../../assets/images/nutrition.jpg'
import gym from '../../assets/images/gym.jpg'
import swal from 'sweetalert';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';
import { useRazorpay, RazorpayOrderOptions } from "react-razorpay";


export default function Premiumpage() {

  const [trainers, setTrainers] = useState([])
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userId = useSelector((state) => state.user.userId);
  const [premiummember, setCheckpremium] = useState(false)

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { error, isLoading, Razorpay } = useRazorpay();


  useEffect(() => {
    if (!userId) return; // Skip if no userId

    const checkPremium = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/userroute/getpremium/${userId}`);
        setCheckpremium(response.data.premium);
      } catch (error) {
        console.error('Error checking premium status:', error);
      }
    };

    checkPremium();
  }, [userId]);

  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve, reject) => {
        const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
        if (existingScript) {
          console.log('Razorpay script already loaded');
          resolve(true);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        // script.async = true;
        script.onload = () => {
          console.log('Razorpay script loaded successfully');
          resolve(true);
        };
        script.onerror = () => {
          console.error('Failed to load Razorpay script');
          reject(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript().catch(() => {
      console.error('Error loading Razorpay script');
    });
  }, []);


  const handlePayment = async (amount, description, planDuration) => {

    try {

      if (!userId) {
        toast.error('login first')
        localStorage.setItem('redirectUrl', window.location.pathname);
        navigate('/login')
        return
      }

      if (premiummember) {
        toast.error('You are already a premium member')
        return
      }
      // if (typeof window.Razorpay === 'undefined') {
      //   toast.info('Loading payment service. Please wait...');
      //   await new Promise((resolve, reject) => {
      //     const script = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      //     if (script) {
      //       script.onload = () => resolve(true);
      //       script.onerror = () => reject(false);
      //     } else {
      //       reject(false);
      //     }
      //   }).catch(() => {
      //     toast.error('Payment service is not available. Please try again later.');
      //     return;
      //   });
      // }

      // if (typeof window.Razorpay === 'undefined') {
      //   toast.error('Payment service failed to load. Please refresh the page and try again.');
      //   return;
      // }


      console.log('Amount passed to backend (in paise):', amount * 100);
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/userroute/create-order`, {
        amount: amount * 100,
        currency: 'INR',
        userId,
        planDuration
      })
      const order = response.data.order
      console.log(process.env.REACT_APP_RAZORPAY_KEY_ID, 'the key')
      console.log(response.data, 'amount recieving')

      let razorpayObj = {
        key_id:process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount:order.amount,
        currency:order.currency,
        order_id:order.id,
        name:'WELLNESS TIME PREMIUM',
        description:'',
        'prefill[name]':'KRISHNAPRIYA UA',
        'prefill[contact]':'6238909694',
        'prefill[email]':'customercare@wellnesstime.com',
        'notes[userIdF]':userId,
        'metadata[userIdF1]':userId,
        callback_url:`${process.env.REACT_APP_BACKEND_ROUTE}/userroute/verify-payment`,
        cancel_url:`${process.env.REACT_APP_BACKEND_ROUTE}/userroute/failed-payment`

      }

       // Create a form element
        const form = document.createElement("form");
        form.setAttribute("method", "POST");
        form.setAttribute("action", "https://api.razorpay.com/v1/checkout/embedded"); // Razorpay's redirection URL

        Object.keys(razorpayObj).forEach((key) => {
          const input = document.createElement("input");
          input.setAttribute("type", "hidden");
          input.setAttribute("name", key);
          input.setAttribute(
            "value",
            typeof razorpayObj[key] === "object" ? JSON.stringify(razorpayObj[key]) : razorpayObj[key]
          );
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();



      // const options = {
      //   key: process.env.REACT_APP_RAZORPAY_KEY_ID,
      //   amount: order.amount,
      //   currency: order.currency,
      //   name: 'WELLNESS TIME PREMIUM',
      //   description,
      //   order_id: order.id,
      //   handler: async (response) => {
      //     try {
      //       console.log('Payment successful response:', response);


      //       const verifyresponse = await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/userroute/verify-payment`, {
      //         order_id: order.id,
      //         payment_id: response.razorpay_payment_id,
      //         razorpay_signature: response.razorpay_signature,
      //         userId: userId,
      //         planDuration: planDuration
      //       })

      //       if (verifyresponse.data.success) {



      //         swal({
      //           title: "Payment Successful!",
      //           text: "Congratulations! You have been upgraded to premium membership.",
      //           icon: "success",
      //           buttons: false,
      //           timer: 4000, // Automatically close after 3 seconds
      //         });

      //         dispatch(setPremium(true))
      //         setTimeout(() => {
      //           navigate('/premium/premiumuser')
      //         }, 2000);
      //       }
      //       else {
      //         throw new Error(verifyresponse.data.message || 'Payment verification failed')
      //       }

      //     } catch (error) {
      //       console.error('Error during payment verification:', error);

      //       swal({
      //         title: "Verification Error",
      //         text: "An error occurred during payment verification. Please try again.",
      //         icon: "error",
      //         button: "Okay",
      //       });

      //     }
      //   },

      //   prefill: {
      //     name: 'kp',
      //     email: 'customer@gmail.com',
      //     contact: '6238933694'

      //   },
      //   theme: {
      //     color: 'black'
      //   }

      // }

      // console.log(options,"OPTIONS")

      // const paymentObject = new window.Razorpay(options);
      // paymentObject.open();

      // // const razorpayInstance = new Razorpay(options);
      // paymentObject.on("payment.failed", function (response) {
      //   console.error("Payment Failed", response.error);
      //     swal({
      //       title: "Payment Failed",
      //       text: response.error.description || 'An unknown error occurred.',
      //       icon: "error",
      //       button: "Got it",
      //   });
      // });
      // // razorpayInstance.open();

    } catch (error) {
      console.error('Error during payment initiation:', error);
      swal({
        title: "Payment Initialization Failed",
        text: "Unable to initiate payment. Please try again.",
        icon: "error",
        button: "Retry",
      });

    }
  }

   // Handle global errors if any from useRazorpay
    if (error) {
      console.error("Razorpay Error OBJ123: ", error);

    }

  const openModal = (trainer) => {
    setSelectedTrainer(trainer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTrainer(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/listtrainer`);
      setTrainers(response.data);
    } catch (error) {
      console.error('Error fetching trainers:', error);
    }
  };

  return (
    <div className="workoutp">
      <Navbar />
      <ToastContainer />
      <div className="ourworkoutp my-5">
        <div className="text-center mb-4">
          <h5
            className="headp text-center p-1 mb-3"
            style={{
              letterSpacing: '4px'
            }}>
            UNLOCK YOUR FULL POTENTIAL WITH PREMIUM
          </h5>
          <p
            className="textp text-start p-1 mb-5"
            style={{
              width: '50%',
              margin: '0 auto',
              color: '#000000b8'
            }}>
            Get full access to personalized workouts, expert nutrition tips, and premium
            wellness features
          </p>
        </div>
        <div className="boxes m-5 p-4">
          <div
            style={{
              marginLeft: '12rem'
            }}
            className='first col-lg-4 col-md-4 col-sm-4 col-4'
            onClick={() => handlePayment(399, 'Rs.399 per month', 'month')}>

            <Box className='boxp'>₹399
              <br />
              PER MONTH</Box>
          </div>
          <div className='col-lg-4 col-md-4 col-sm-4 col-4'
            onClick={() => handlePayment(2399, '2399 for 6 months', '6_months')}>
            <Box className='boxp'>₹2399
              <br />FOR 6 MONTH</Box>
          </div>
          <div className='col-lg-4 col-md-4 col-sm-4 col-4'
            onClick={() => handlePayment(4099, '4099 per year', 'year')}>
            <Box className='boxp'>₹4099
              <br />
              PER YEAR</Box>
          </div>

        </div>
      </div>

      <div className="ourworkoutp mt-4">
        <h5
          className="headm mb-4"
          style={{
            letterSpacing: '4px',
          }}
        >
          MEET OUR TRAINERS
        </h5>

        <div className="scroll-wrapper">
          <button
            className="scroll-btn left"
            onClick={() =>
              document.querySelector('.scroll-container').scrollBy({
                left: -300,
                behavior: 'smooth',
              })
            }
          >
            &lt;
          </button>
          <div className="scroll-container">
            {trainers.map((trainer, index) => {
              const image = trainer.profilephoto

              return (
                <div className="trainer-card col-lg-3 col-md-3 col-sm-3" key={index}>
                  <img key={index}
                    src={`${process.env.REACT_APP_BACKEND_ROUTE}/${image}`} alt="Arjun Menon" className="trainer-img" />
                  <h6 className="trainer-name">{trainer.name.toUpperCase()}</h6>
                  <p className='trainer-desc'>
                    Specialised in {Array.isArray(trainer.skills)
                      ? trainer.skills.map((skill, index) => (
                        <div key={index}>{skill}</div>
                      ))
                      : trainer.skills
                        .split(',')
                        .map((skill, index) => (
                          <div key={index}>{skill.trim()}</div>
                        ))}
                  </p>
                  <Link to="#" onClick={() => openModal(trainer)} className="trainer-link">
                    know more
                  </Link>
                </div>
              )
            })}
            <Dialog open={isModalOpen} onClose={closeModal}>
              {selectedTrainer && (
                <>
                  <DialogTitle className='popname'>{selectedTrainer.name.toUpperCase()}</DialogTitle>
                  <DialogContent>
                    <div className='knowmore' style={{ display: 'flex', flexDirection: 'row' }}>
                      <div>
                        <img
                          src={`${process.env.REACT_APP_BACKEND_ROUTE}/${selectedTrainer.profilephoto}`}
                          alt={selectedTrainer.name}
                          className='popimage'
                        />
                      </div>
                      <div>
                        <p>{selectedTrainer.email}</p>
                        <p>{selectedTrainer.name}  {selectedTrainer.experience}.</p>
                        <p>Specialised in  {selectedTrainer.skills.join(', ')}</p>

                      </div>
                    </div>

                  </DialogContent>
                  <DialogActions>
                    <Button onClick={closeModal} className='editp'>Close</Button>
                  </DialogActions>
                </>
              )}
            </Dialog>
          </div>

          <button
            className="scroll-btn right"
            onClick={() =>
              document.querySelector('.scroll-container').scrollBy({
                left: 300,
                behavior: 'smooth',
              })
            }
          >
            &gt;
          </button>
        </div>



        <div className="wanna mt-5" style={{ width: '70%' }}>
          <p>
            Wanna Be A Part Of Our Team As A Trainer?{' '}
            <Link to="/join-us" className="join-link">
              Click Here
            </Link>
          </p>
        </div>

      </div>
      <div className="ourworkoutp  mt-3">
        <h5 className='headm mt-4 mb-5' style={{ letterSpacing: '4px' }} >DISCOVER THE BENEFITS</h5>

        <div className="premiumbox mt-4">
          <div className="premium  ">
            <img src={call} alt="" />
            <p>Priority Support and Community Access – Provide premiere users with faster
              support and access to a community of like-minded individuals for motivation and
              accountability.</p>
          </div>
          <div className="premium  ">
            <img src={tree} alt="" />
            <p>Exclusive Meditation Tracks – Offer guided meditation sessions or relaxing
              soundscapes available only to premiere users, helping them focus on mindfulness
              and relaxation.</p>
          </div>
          <div className="premium  ">
            <img src={nutrition} alt="" />
            <p>Nutrition and Wellness Tips – Offer expert tips on nutrition, mental wellness
              , and recovery to complement physical workouts, giving a holistic approach to
              health.</p>
          </div>
          <div className="premium">
            <img src={gym} alt="" />
            <p>Personalized Workout Plans – Highlight custom workout routines tailored to
              the user’s fitness level and goals , like strength training, cardio, or
              flexibility.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

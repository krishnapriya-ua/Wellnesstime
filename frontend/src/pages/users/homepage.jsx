import React,{useState,useRef} from 'react'
import '../../assets/styles/home.css'

import head from '../../assets/images/head.jpg';
import nut from '../../assets/images/nut.jpg';
import tre from '../../assets/images/tre.jpg';
import '../../assets/styles/slider.css';
import axios from 'axios'
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';
import call from '../../assets/images/call.jpg'
import tree from '../../assets/images/tree.jpg'
import nutrition from '../../assets/images/nutrition.jpg'
import gym from '../../assets/images/gym.jpg'
import trainer from '../../assets/images/medi2.jpg'
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {Navbar} from './navbar';
import { useEffect } from 'react'
import { LoginModal } from './loginpopup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import Carousel from "react-material-ui-carousel";

export default function Homepage() {

    const [workouts, setWorkouts] = useState([]);
    const { isAuthenticated,blocked,userId } = useSelector((state) => state.user);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');
    const [feedback,setFeedback]=useState([])
    const [currentindex,setCurrentIndex]=useState(0)
   
    const navigate=useNavigate()
  const slides = [
    {
      image: head,
      title: 'WELLNESS TIME',
      description:
        'Get your favorite tunes to accompany your personalized workout, and let the rhythm fuel your progress',
           background: 'linear-gradient(45deg, #093e53, #000000e0)',
      color: 'white',
      buttonText: 'Get Started for Free',
      link:'/select-workout'
    },
    {
      image: nut,
      title: 'NOURISH TO FLOURISH',
      description: 'Get your curated selection of nutritious meals  by expert trainers. Enhance health  with your premium membership.',
      
     background: 'linear-gradient(143deg, #fbfbfb, #b9a094)',
      color: 'black',
      buttonText: 'Upgrade to Premium',
      link:'/premium'
    },
    {
      image: tre,
      title: 'GET YOUR TRAINER',
      description: 'Get your trainer and unlock  potential with  premium membership. Elevate your journey with exclusive offers .',
       background: 'linear-gradient(9deg, rgb(43 24 20 / 88%), rgb(15 9 7))',
      color: 'white',
    
      buttonText: 'Upgrade to Premium',
       link:'/premium',
    },
  ];


  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/workouts`); // Replace with your API endpoint
      setWorkouts(response.data); // Assuming the API returns a list of workouts
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };
  const handleWorkoutClick = (workout) => {
    console.log(blocked)
    if(blocked){
      toast.error('blocked')
      return
    }
    else if (isAuthenticated) {
      navigate(`/timer/${workout._id}`, { state: {workout} }); // Redirect if authenticated
    } else {
      setShowLoginModal(true); // Show login modal if not authenticated
    }
  };


  
  
   const handleSubmit = async (e) => {
      e.preventDefault();
  
      if (!feedbackText.trim()) {
        toast.error('Feedback cannot be empty!');
        return;
      }
  
      try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/userroute/feedback`, {
          userId,
          feedbackText,
        });
        if(!userId){
          toast.error('You have to login first')
        }
  
        toast.success('Thank you for your feedback!');
        setFeedbackText('');
      } catch (error) {
        console.error(error);
        toast.error('you have to login first');
      }
    };
  
    useEffect(()=>{
      const fetchFeedback=async()=>{
        try {
          const response=await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/userroute/feedback`)
          setFeedback(response.data)
        } catch (error) {
          console.error('Error fetching feedbacks:', error);
        }
      }
      fetchFeedback()
    },[])

    useEffect(()=>{
    const interval=setInterval(() => {
      setCurrentIndex((prevIndex)=>(prevIndex+2)%(feedback.length||1))
    }, 6000);

    return()=> clearInterval(interval)

    },[feedback.length])


    const currentFeedback=feedback.slice(currentindex,currentindex+2)

   
  return (
    <div className="home">
      <Navbar />
      <ToastContainer/>
      <div className="slider-container">
      <Carousel
          indicators={false} // Optional: Hide dot indicators
          navButtonsAlwaysVisible={true} // Show navigation buttons
          autoPlay={true} // Enable autoplay
          interval={6000} 
          duration={600}// Slide every 5 seconds
          animation="slide" // Smooth slide animation
          swipe={true} // Enable swipe
          fullHeightHover={false}
          stopAutoPlayOnHover={false} 
         
          
        >
        
          {slides.map((slide, index) => (
            <div
              className={`slide ${index === 0 ? 'active' : ''}`}
              key={index}
              style={{ background: slide.background, color: slide.color }}
            >
              <div className="image-container">
                <img src={slide.image} alt={`Slide ${index + 1}`} />
              </div>
              <div className="text-container">
                <h2 className='contenth3'>{slide.title}</h2>
                <p className='contentp'>{slide.description}</p>
                <Link to={slide.link}>
                  <Button className="slide-button" style={{ color: slide.color,background:slide.background }}>
                    {slide.buttonText}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
      
       </Carousel>
      </div>
  

            <div className="ourworkout col-md-12  col-sm-12 col-12">
                <h4 className='our '>OUR WORKOUTS</h4>
                <p className='para'>Explore a variety of workout routines tailored to your
                    fitness level and goals. Whether it's strength training, yoga, cardio, or
                    mindfulness practices, we have something for everyone. Choose your favorite and
                    transform your wellness journey!</p>
            </div>
            <div className="workout-gallery">
        {workouts.map((workout, index) => (
          <div className="workout-box"  onClick={() => handleWorkoutClick(workout)} key={index} style={{ width: '250px' }}>
            {/* Dynamic image source and text */}
            <img src={`${process.env.REACT_APP_BACKEND_ROUTE}/${workout.photos[0]}`} alt={workout.name} />
            <p>{workout.name}</p>
          </div>
        ))}
      </div>
            <div className="ourworkout mt-1">
                <h4 className='our '>TRY OUR PREMIUM VERSION</h4>
                <p className='para'>Ready to go deeper? Try our premiere version for access to
                    custom workout plans, guided meditation, and exclusive wellness insights. Your
                    next level of health await.</p>
                <Link to='/premium'>
                <Button className='try'>TRY NOW
                </Button>
                </Link>
              
                <div className="premiumbox mt-4">
                    <div className="premium  ">
                        <img src={call} alt=""/>
                        <p>Priority Support and Community Access – Provide premiere users with faster
                            support and access to a community of like-minded individuals for motivation and
                            accountability.</p>
                    </div>
                    <div className="premium  ">
                        <img src={tree} alt=""/>
                        <p>Exclusive Meditation Tracks – Offer guided meditation sessions or relaxing
                            soundscapes available only to premiere users, helping them focus on mindfulness
                            and relaxation.</p>
                    </div>
                    <div className="premium  ">
                        <img src={nutrition} alt=""/>
                        <p>Nutrition and Wellness Tips – Offer expert tips on nutrition, mental wellness
                            , and recovery to complement physical workouts, giving a holistic approach to
                            health.</p>
                    </div>
                    <div className="premium">
                        <img src={gym} alt=""/>
                        <p>Personalized Workout Plans – Highlight custom workout routines tailored to
                            the user’s fitness level and goals , like strength training, cardio, or
                            flexibility.
                        </p>
                    </div>
                </div>
            </div>

            <div className="row">
      {currentFeedback.map((item, index) => (
        <div key={index} className={`col-md-6 col-lg-6 col-sm-12 col-12`}>
          <div className="feed">
            <img
              className="feedimg"
              src={`${process.env.REACT_APP_BACKEND_ROUTE}/${item.userId?.profilephoto}` || 'defaultProfilePhoto.jpg'}
              alt={`${item.userId?.firstname || 'User'}'s feedback`}
            />
            <p>
              {item.feedbackText} — <span style={{textTransform:'lowercase'}}>{item.userId?.firstname} {item.userId?.lastname}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
            <div className="row my-5" >
                <div className="col-md-6 col-12 col-sm-12 lg-6 ">
                    <div className="feedi">
                        <h4 className='our '>JOIN OUR WELLNESS FAMILY</h4>
                        <p className='para'>Join the Wellness Family Newsletter . Sign up to stay
                            connected with the latest updates, personalized wellness insights, and early
                            access to special content designed just for you.</p>
                        <div
                            className="feedo mt-4"
                            style={{
                                justifySelf: 'auto'
                            }}>

                            <input type="text" placeholder='EMAIL' name="" id=""/>
                            <Button>SUBSCRIBE</Button>
                        </div>
                    </div>

                </div>
                <div className="aim col-md-6 col-12 col-sm-12 mt-3 lg-6">
                    <div className="feedan ">

                        <p style={{padding:'1rem'}}>We have only one aim : to take care of your wellness. Every feature is
                            crafted to support your journey toward a healthier, balanced life. please let us
                            know your feedback . Enter your feedback here

                        </p>
                        <div className="feedm" style={{justifyItems:'normal',textAlign:'start'}}>
                            <form onSubmit={handleSubmit}>
                              <div>
                            <TextField type="text"
                            placeholder='Enter feedback here'
                             value={feedbackText}
                              onChange={(e) => setFeedbackText(e.target.value)}
                              multiline
                              className='feedback-input'
                              rows={6}
                             style={{ margin: '1rem',background:'white',fontSize:'x-small',width:'68%' }}/>
                             
                            <Button style={{verticalAlign:'bottom'}} type='submit'>SEND</Button>
                            </div>
                            </form>
                           
                        </div>
                    </div>
                </div>
            </div>
            {showLoginModal && (
  <LoginModal
    isOpen={showLoginModal}
    onClose={() => setShowLoginModal(false)} // Close modal when the user clicks outside or on the close button
  />
)}
            </div>
        
    )
}

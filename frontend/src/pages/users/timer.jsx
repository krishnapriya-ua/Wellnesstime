import '../../assets/styles/timer.css';
import { Navbar } from './navbar';
import React, { useState, useEffect , useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import axios from 'axios';
//import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { startWorkout } from '../../redux/slices/timerSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';



export default function Timer() {
  const { state } = useLocation();
  const { id } = useParams(); // This gets the workout ID from the URL
  const [workout, setWorkout] = useState(state?.workout || {});
  const [selectedTime, setSelectedTime] = useState(null); // Time in seconds
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [selectedHours, setSelectedHours] = useState(0)
  const [selectedMinutes, setSelectedMinutes] = useState(0)
  const [isChooseselected,setIschooseselected]=useState(false)
  const [workInterval,setWorkInterval] = useState(0)
  const [restInterval,setRestInterval] = useState(0)

  const navigate=useNavigate()
  const dispatch=useDispatch()
  const hoursRef=useRef(null)
  const minuteRef=useRef(null)


  useEffect(() => {
    if (hoursRef.current) {
      const hourItem = hoursRef.current.children[selectedHours];
      hourItem?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (minuteRef.current) {
      const minuteItem = minuteRef.current.children[selectedMinutes];
      minuteItem?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedHours, selectedMinutes]);

  useEffect(() => {
   fetchWorkoutById()
  },[]);


  const fetchWorkoutById = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/workout/${id}`);
      setWorkout(response.data);
     
    } catch (error) {
      console.error('Error fetching workout by ID:', error);
    }
  };

  // Handle button clicks for predefined times (e.g., 10, 15, 20 minutes for meditation)
  const handleTimeSelection = (time) => {
    let timeInSeconds = 0;
   
    switch (time) {
      case '10 Minutes':
        timeInSeconds = 10 * 60;
        break;
      case '15 Minutes':
        timeInSeconds = 15 * 60;
        break;
      case '20 Minutes':
        timeInSeconds = 20 * 60;
        break;
      case '20 Minutes:20:10':
        timeInSeconds = 20 * 60; 
        setWorkInterval(20)
        setRestInterval(10)
        break;
      case '30 Minutes:50:10':
        timeInSeconds = 30 * 60 ;
        setWorkInterval(50)
        setRestInterval(10)
        break;
      case '40 Minutes:60:10':
        timeInSeconds = 40 * 60;
        setWorkInterval(60)
        setRestInterval(10)
        break;
      default:
        break;
    }
    setSelectedTime(timeInSeconds);
    setIschooseselected(false)
    setIsCustomTime(false); // Set to false if predefined time is selected
  };

  // Handle custom time input
  const handleCustomTime = () => {
    setIsCustomTime(true); 
    setIschooseselected(true)
  };

  const handleStartClick = (e) => {
    if (selectedTime===0) {
      e.preventDefault();  // Prevent navigation or further action
      toast.error('Please select a valid time! Time cannot be 0 hours and 0 minutes.');
      return;
    }
    if (!selectedTime || !workout._id) {
      e.preventDefault(); // Prevent navigation
      if (!selectedTime) toast.error('Please select a time before starting!');
      if (!workout._id) toast.error('Workout ID is missing!');
      return
    }

   
    dispatch(startWorkout({
      workoutId:workout._id,
      workoutName:workout.name,
      selectedTime,
      workInterval,
      restInterval
    }))
    console.log(workInterval,restInterval)
    dispatch({ type: 'SET_SELECTED_TIME', payload: 600 });
    setTimeout(() => {
      navigate(`/workout/${workout._id}`);  // Navigate after a small delay
    }, 100); 
  };
  useEffect(()=>{
    setSelectedTime(selectedHours*3600+selectedMinutes*60)
  },[selectedHours,selectedMinutes])
 
  return (
    <div className="workoutt">
      <Navbar />
      <div className="containert my-5">
        <div className="text-center mb-1">
          <h5 className="headn text-center mb-3" style={{ letterSpacing: '4px' }}>
            WORKOUT TIMER
          </h5>
          <p
            className="sub text-center p-1 mb-4"
            style={{ width: '80%', margin: '0 auto', color: '#000000b8' }}
          >
            Remember, even a little movement is better than none. Every step counts towards a
            healthier, stronger you. Each moment you commit brings you closer to your goals and
            helps build lasting strength and resilience.
          </p>
        </div>

        <div className="box-containert p-4 text-center">
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div>
              <img
                className="idimage"
                src={`${process.env.REACT_APP_BACKEND_ROUTE}/${workout.photos && workout.photos[0]}`}
                alt={workout.name}
              />
            </div>
            <div>
              <p
                className="text text-start mb-3"
                style={{ width: '98%', margin: '0 auto', color: '#000000b8' }}
              >
                {workout.description}
              </p>
            </div>
          </div>
          <p className="headn text-center mb-4" style={{ letterSpacing: '4px' }}>
            SELECT TIME HERE
          </p>

          <div className="section d-flex justify-content-center gap-3 mt-1">
            {/* Check if workout is meditation or not */}
            {workout.name === 'MEDITATION' ? (
              // Buttons for meditation (fixed time selections)
              <>
                <Button
                  variant="contained"
                  className={`timebutton ${selectedTime === 10 * 60 ? 'selected' : ''}`}
                  onClick={() => handleTimeSelection('10 Minutes')}
                >
                  10 Minutes
                </Button>
                <Button
                  variant="contained"
                  className={`timebutton ${selectedTime === 15 * 60 ? 'selected' : ''}`}
                  onClick={() => handleTimeSelection('15 Minutes')}
                >
                  15 Minutes
                </Button>
                <Button
                  variant="contained"
                  className={`timebutton ${selectedTime === 20 * 60 ? 'selected' : ''}`}
                  onClick={() => handleTimeSelection('20 Minutes')}
                >
                  20 Minutes
                </Button>
              </>
            ) : (
              // Buttons for other workouts (work:rest format)
              <>
                <Button
                  variant="contained"
                  className={`timebutton ${selectedTime === (20 * 60) ? 'selected' : ''}`}
                  onClick={() => handleTimeSelection('20 Minutes:20:10')}
                >
                  20 MIN <br />
                  20 SEC :10 SEC
                </Button>
                <Button
                  variant="contained"
                  className={`timebutton ${selectedTime === (30 * 60 ) ? 'selected' : ''}`}
                  onClick={() => handleTimeSelection('30 Minutes:50:10')}
                >
                  30 MIN <br />
                  50 SEC :10 SEC
                </Button>
                <Button
                  variant="contained"
                  className={`timebutton ${selectedTime === (40 * 60) ? 'selected' : ''}`}
                  onClick={() => handleTimeSelection('40 Minutes:60:10')}
                >
                  40 MIN <br />
                  1 MIN :10 SEC
                </Button>
              </>
            )}

            {/* "Choose" Button - Opens custom time selection */}
            <Button variant="contained" className={`timebutton ${isChooseselected ? 'selected' : ''}`} onClick={handleCustomTime}>
              CHOOSE
            </Button>

            {isCustomTime && (
          <div className="modal-overlayy">
            <div className="modal-contentt">
              <div style={{display:'flex',flexDirection:'row',justifyContent:'end'}}>
             
              <Button variant='contained' className='closebutton' style={{background:'transparent',color:'red',fontSize:'x-small',boxShadow:'none'}} onClick={()=>{
                setIsCustomTime(false)
                setIschooseselected(false)
                }}> 
                
                <CloseIcon  />
             
              </Button>
              </div>
              <h6 style={{letterSpacing:'2px'}} className='m-3'>SELECT TIME</h6>
             
              <div className="picker-container">
                {/* Hours Picker */}
                <div className="picker">
                  <p>Hours</p>
                  <div className="wheel" ref={hoursRef}>
                    {Array.from({ length: 24 }, (_, i) => (
                      <div
                        key={i}
                        className={`wheel-item ${selectedHours === i ? 'selected' : ''}`}
                        onClick={() => setSelectedHours(i)}
                      >
                        {i} hr
                      </div>
                    ))}
                  </div>
                </div>

                {/* Minutes Picker */}
                <div className="picker">
                  <p>Minutes</p>
                  <div className="wheel" ref={minuteRef}>
                  <div
              className={`wheel-item ${selectedMinutes === 0 ? 'selected' : ''}`}
              onClick={() => setSelectedMinutes(0)}
            >
              0 min
            </div>

            {/* 30 sec */}
            <div
              className={`wheel-item ${selectedMinutes === 0.5 ? 'selected' : ''}`}
              onClick={() => setSelectedMinutes(0.5)}
            >
              30 sec
            </div>
                    {Array.from({ length: 59 }, (_, i) => (
                      <div
                        key={i}
                        className={`wheel-item ${selectedMinutes === i+1 ? 'selected' : ''}`}
                        onClick={() => setSelectedMinutes(i+1)}
                      >
                        {i+1} min
                      </div>
                    ))}
                  
                  </div>
                </div>


              {workout.name !== 'MEDITATION' && (
          <>
          <div style={{display:'flex',flexDirection:'column',fontSize:'small'}}>
          <p style={{paddingTop:'21px',marginBottom:'0rem'}}>OPTIONAL</p>
          <div className="picker" style={{marginBottom:'-1rem'}}>
              <p >Work Interval (seconds)</p>
              
              <input
                type="number"
                value={workInterval}
                onChange={(e) => setWorkInterval(Number(e.target.value))}
                placeholder="Enter work interval"
              />
            </div>
            <div className="picker"  style={{marginBottom:'-1rem'}}>
             
              <p>Rest Interval (seconds)</p>
              <input
                type="number"
                value={restInterval}
                onChange={(e) => setRestInterval(Number(e.target.value))}
                placeholder="Enter rest interval"
              />
            </div>
          </div>
           
          </>
        )}
      </div>
              <Button
              style={{background:'black',fontSize:'small'}}
                variant="contained"
                className="timebuttonn"
                onClick={() => {
                  setIsCustomTime(false);
                 
                }}
              >
                SET TIME
              </Button>
            </div>
          </div>
        )}

          
              <Button variant="contained" className="timebutton" onClick={handleStartClick}>
                START
              </Button>
           
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

import '../../assets/styles/startworkout.css';
import { Navbar } from './navbar';
import React, { useState, useEffect,useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import count from '../../assets/tones/male.mp3'
import over from '../../assets/tones/over.mp3'
import halfway from '../../assets/tones/try.mp3'
import Swal from 'sweetalert2';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PlayArrow, Pause, SkipPrevious, SkipNext, FastRewind, FastForward } from '@mui/icons-material';

export default function Startworkout() {

  const selectedTime=useSelector((state)=>state.timer.selectedTime)
  const workInterval=useSelector((state)=>state.timer.workInterval)
  const restInterval=useSelector((state)=>state.timer.restInterval)
  const userId= useSelector((state)=>state.user.userId)
  const { id } = useParams();
  const audioRef=useRef(null)
 
  const [workout, setWorkout] = useState({});
  const [musicTracks, setMusicTracks] = useState([]);
  const[countdown,setCountdown]=useState(3)
  const[countdownactive,setContdownActive]=useState(true)
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [workRestCountdown, setWorkRestCountdown] = useState(workInterval); 

  const [isWorkPhase, setIsWorkPhase] = useState(true); 
  const [showAlert, setShowAlert] = useState(false); // Show background alert
  const [alertMessage, setAlertMessage] = useState(''); // Message for the alert



  const [remainingTime, setRemainingTime] = useState(selectedTime); 
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const bellsound=new Audio(over)
  const intervalBeep = new Audio(halfway);
  

  useEffect(()=>{
   bellsound.load()
   intervalBeep.load()
  },[])
 
  useEffect(()=>{
    let countdowninterval;
    if(countdownactive&&countdown>0){
      const audio=new Audio(count)
      if(!audioPlayed){
        audio.play()
        setAudioPlayed(true)
  
      }
     
      countdowninterval=setInterval(()=>{
        setCountdown((prevCountdown)=>prevCountdown-1)
        setAudioPlayed(true)
      },1000)
    }

    if(countdown===0){
      setContdownActive(false)
      setTimeout(() => {
        setRemainingTime(selectedTime)

        setIsMusicPlaying(true)
    
      },300);
      
    }
    return () => clearInterval(countdowninterval);
   
  },[countdownactive,countdown,selectedTime,audioPlayed])



  useEffect(() => {
    let workRestInterval;
    if (!countdownactive && workRestCountdown > 0 && isMusicPlaying) {

      workRestInterval = setInterval(() => {
        setWorkRestCountdown((prevTime) => prevTime - 1);
      }, 1000);
    }
    if (!countdownactive && workRestCountdown === 3 && isMusicPlaying) {
      // Play beep sound when countdown reaches 3
     
      intervalBeep.play();
    }
    if (!countdownactive&&restInterval>0&&workRestCountdown === 0 && isMusicPlaying) {
     
      
      setAlertMessage(isWorkPhase ? 'REST!' : 'WORK!');
      setShowAlert(true);
      // Switch to the other phase (work or rest)
      setIsWorkPhase((prevPhase) => !prevPhase);
      setWorkRestCountdown(isWorkPhase ? restInterval : workInterval); // Set next phase time

      setTimeout(() => {
        setShowAlert(false);
      }, 2000);
      if (isWorkPhase) {
        // Play music after switching to rest phase
        setIsMusicPlaying(true);
      }
    }

    return () => clearInterval(workRestInterval);
  }, [countdownactive, workRestCountdown, isWorkPhase, workInterval, restInterval,isMusicPlaying]);

 


  useEffect(()=>{
    if(remainingTime<=0 && !countdownactive){
      saveworkoutTime()
    }
  },[remainingTime,countdownactive])

  const saveworkoutTime=async()=>{
    try {
    
     const totalTime=selectedTime-remainingTime
     const payload={
      userId,
      workoutId:id,
      duration:totalTime,
      workoutName:workout.name||''

     }
     console.log(payload,'Workout details')
     
      const response=await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/userroute/save-workout`,payload)
     console.log(response.data)
    } catch (error) {
      console.error('Error saving workout time:', error);
    }

  }


  useEffect(()=>{
    setRemainingTime(selectedTime)
    
  },[selectedTime])

  useEffect(() => {
   fetchWorkoutById()
  });

  const fetchWorkoutById = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/workout/${id}`);
      setWorkout(response.data);
    } catch (error) {
      console.error('Error fetching workout by ID:', error);
    }
  };

 
  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/userroute/music?category=${workout.name}`);
        setMusicTracks(response.data);
      } catch (error) {
        console.error('Error fetching music:', error);
      }
    };

    if (workout.name) {
      fetchMusic();
    }
  }, [workout.name]);

 
  useEffect(() => {
    if (!countdownactive&& isMusicPlaying && remainingTime > 0) {
      let bellsoundplayed=false
     
      const timer = setInterval(() => {
        setRemainingTime((prevTime) =>{
          if(prevTime<=1){
            clearInterval(timer)
            if(!bellsoundplayed){
             
              bellsound.play()
              bellsoundplayed=true

            }
            const audioElement = document.getElementById(`audio-${currentTrackIndex}`);
            if (audioElement) audioElement.pause();
            setIsMusicPlaying(false); // Pause music
            Swal.fire({
              icon: 'success',
              title: `Congrats! You have completed your ${workout.name.toLowerCase()} session! 🎉`,
             
              confirmButtonText: 'Got it!',
              confirmButtonColor: '#4CAF50',
              width: 550,
              padding: '2em',
              background: '#fff',
              customClass: {
                title: 'custom-swal-title', 
                popup: 'custom-swal-popup', 
              }
             
            });
          }
          return prevTime-1

        } );
      }, 1000);

      

      return () => clearInterval(timer);
    }
  }, [remainingTime, isMusicPlaying,countdownactive,currentTrackIndex]);


  useEffect(() => {
    if (musicTracks.length > 0 && currentTrackIndex < musicTracks.length) {
      const audioElement = document.getElementById(`audio-${currentTrackIndex}`);
      if (audioElement) {
        if (isMusicPlaying) {
          audioElement.play();
        } else {
          audioElement.pause();
        }

       
        audioElement.onended = () => {
          setCurrentTrackIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % musicTracks.length; // Loop back to the first track
            setTimeout(() => {
              const nextAudioElement = document.getElementById(`audio-${nextIndex}`);
              if (nextAudioElement) {
                nextAudioElement.play(); 
                setIsMusicPlaying(true);
              }
            }, 200); 
            return nextIndex;
          });
        };
      }
    }
  }, [currentTrackIndex, musicTracks, isMusicPlaying]);

  
  const formatTime = (seconds) => {
    if (seconds < 0) return '0:00';
    const hours=Math.floor(seconds/3600)
    const minutes = Math.floor((seconds % 3600)/60);
    const secs = seconds % 60;
    return hours > 0
    ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    : `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

  

  const playNextTrack = () => {
    if (currentTrackIndex < musicTracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
      setCurrentTime(0);
      setIsMusicPlaying(true);
    }
  };
  
  const playPreviousTrack = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
      setCurrentTime(0); 
      setIsMusicPlaying(true);
    }
  };
  
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };
  
  const forward10Seconds = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + 10,
        audioRef.current.duration
      );
    }
  };
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(Math.round(audioRef.current.currentTime)); 
      setDuration(Math.round(audioRef.current.duration || 0)); 
    }
  };
  
  const rewind10Seconds = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
    }
  };
  
  const updateAudioTime = (value) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  return (
    <div className="workoutt">
      <Navbar />
      {showAlert && (
        <div className="fullscreen-alert">
          <div className="alert-message">
            {alertMessage}
          </div>
        </div>
      )}
      {countdownactive&&(
        <div className='fullscreen-overlay'>
          <div>
          <h5>YOUR WORKOUT STARTS IN :</h5>
          </div>
         
          <div className='countdown'>{countdown}</div>
        </div>
      )}
      <div className="containers my-5">
        <div className='full' style={{display:'flex',flexDirection:'row'}}>
          
        <div className="box-containers p-4 text-center col-md-6">
        {(workInterval > 0 || restInterval > 0) && (
          <div className='mb-3' style={{display:'flex',flexDirection:'row',justifyContent:'center'}}>
            <div>
            <h5 className='mt-2'>{isWorkPhase ? "WORK  " : "REST "} :</h5>
            </div>
           
            <div className="work-rest-countdown" style={{fontSize:'x-large',fontWeight:'bold'}}>{formatTime(workRestCountdown)}</div>
          </div>
        )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
         
          <h2 className="mb-1">
             {countdownactive ? formatTime(countdown) : formatTime(remainingTime)}
          </h2>
         
         
            <div>
              <img
                className="startimage mt-2"
                src={`${process.env.REACT_APP_BACKEND_ROUTE}/${workout.photos && workout.photos[0]}`}
                alt={workout.name}
              />
            </div>
          </div>
         
          <div className="music-section" style={{display:'flex',flexDirection:'column'}}>
          {musicTracks.length > 0 ? (
         <div>
     
     <div className="currently-playing">
  <p className="mb-1" > {musicTracks[currentTrackIndex]?.name || 'No Track Available'}</p>
  {/* Audio tag without its native controls */}
  <audio
    id={`audio-${currentTrackIndex}`}
    ref={audioRef}
    src={`${process.env.REACT_APP_BACKEND_ROUTE}/${musicTracks[currentTrackIndex]?.files[0]}`}
    type="audio/mpeg"
    onTimeUpdate={handleTimeUpdate}
    style={{ display: 'none' }} 
  ></audio>

 
  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '10px',justifyContent:'center' }}>
   
    <button onClick={playPreviousTrack} className='buttonStyle'><SkipPrevious/></button>

   
    <button onClick={rewind10Seconds} className='buttonStyle'><FastRewind/> </button>

   
    <button onClick={togglePlayPause} className='buttonStyle'>
      {isMusicPlaying ?  <Pause/>:<PlayArrow/>}
    </button>

   
    <button onClick={forward10Seconds} className='buttonStyle'><FastForward/> </button>

   
    <button onClick={playNextTrack} className='buttonStyle'><SkipNext/></button>
  </div>


  <div className='progress-container' style={{ display: 'flex', alignItems: 'center', gap: '30px', marginTop: '10px', width: '100%' }}>
    <span>{formatTime(currentTime)}</span>
    <input
      type="range"
      min="0"
      max={Math.floor(duration)}
      value={Math.floor(currentTime)}
      onChange={(e) => updateAudioTime(e.target.value)}
      style={{ flexGrow: 1 }}
       className="progress-bar"
    />
    <span>{formatTime(duration)}</span>
  </div>
</div>

    
    </div>
  ) : (
    <p>No music available.</p>
  )}
   </div>
      </div>

      <div className="playlist-containers col-md-4" style={{marginLeft:'4rem',width:'-webkit-fill-available',height:'fit-content'}}>
     {musicTracks.length > 0 ? (
     <div>
     
      <div className="playlist">
        <h6 className='text-center mb-4' style={{letterSpacing:'2px'}}>PLAYLIST</h6>
        <ul style={{marginLeft:'-2rem'}}>
          {musicTracks.map((track, index) => (
           
            <li
              style={{
                listStyle: 'none',
                backgroundColor: index === currentTrackIndex ? '#00000024' : 'transparent', // Highlight current track
               
              }}
              key={track._id}
              onClick={()=>{
                setCurrentTrackIndex(index);
                setIsMusicPlaying(true)
              }}
            >{index+1}.{'     '}   
              {track.name}
              <audio
                id={`playlist-audio-${index}`}
                src={`${process.env.REACT_APP_BACKEND_ROUTE}/${track.files[0]}`}
                style={{ display: 'none' }}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  ) : (
    <p>No music available.</p>
  )}
      </div>

     </div>
      </div>
      <ToastContainer/>
    </div>
  );
}

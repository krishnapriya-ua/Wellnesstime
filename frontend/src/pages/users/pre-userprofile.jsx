import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../../assets/styles/userprofile.css';
import { Navbar } from './navbar';
import axios from 'axios';
import { Button } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from './cropperImage';  // Import the helper function for cropping
import meditaion from '../../assets/images/meditation.png'
import yoga from '../../assets/images/yoga-pose.png' 
import runner from '../../assets/images/runer.png'
import weight from '../../assets/images/weightlifting.png'
import WorkoutBarChart from './barcharts';
import { Link } from 'react-router-dom';
import BMIChart from './guagechart';
import person from '../../assets/images/person.png'
import { CircularProgressbar } from 'react-circular-progressbar';
import WaterFlowProgress from './waterflow';
import defaultpic from '../../assets/images/default.png'

export default function Premiumuserprofile() {

  const navigate = useNavigate();
  const { firstname, email, lastname, isAuthenticated, userId } = useSelector((state) => state.user);
  
  const [file, setFile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [imageSrc, setImageSrc] = useState(null); 
  const [crop, setCrop] = useState({ x: 0, y: 0 }); 
  const [zoom, setZoom] = useState(1); // Zoom level
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [topworkout,setTopWorkout]=useState([])
  const [trainer, setTrainer] = useState(null);

    const [tasks, setTasks] = useState([]);
    const [checkedtasks, setCheckedTasks] = useState({});
    const [Weight,setWeight]=useState('')
    const [height,setHeight]=useState('')
    const [showmodal,setshowModal]=useState(false)
    const [bmi,setBmi]=useState(null)
    
  
  const workoutIcons = {
    meditation: meditaion,
    yoga: yoga,
    cardio: runner,
    pilates: weight,
    weighttraining:weight
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
   
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/userroute/get-user/${userId}`);
        setPhotoUrl(`${process.env.REACT_APP_BACKEND_ROUTE}/${response.data.profilephoto}`);
      } catch (error) {
        console.error('Error fetching profile photo:', error);
      }
    };

    const fetchTopWorkout=async() =>{
      try {
        const response=await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/userroute/users/${userId}/top-workouts`)
        setTopWorkout(response.data.sortedWorkouts)
        console.log(response.data.sortedWorkouts)
      } catch (error) {
        console.error('Error fetching top workouts:', error);
      }
    }

    fetchProfile();
    fetchTopWorkout()
  }, [isAuthenticated, userId, navigate]);

  const handleDrop = (acceptedFiles) => {
   
    const uploadedFile = acceptedFiles[0];
    setFile(uploadedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result);
    };
    reader.readAsDataURL(uploadedFile);
  };

  const handleUpload = async (croppedImage) => {
    if (!croppedImage) {
      toast.error('Please crop the image first');
      return;
    }

    const blob = await fetch(croppedImage).then((res) => res.blob());
    
    const formData = new FormData();
    formData.append('profilephoto', blob, 'croppedImage.png');
    formData.append('userId', userId);

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/upload-photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newPhotoUrl = `${process.env.REACT_APP_BACKEND_ROUTE}/${response.data.profilephoto}`;
      setPhotoUrl(croppedImage);
      toast.success('Profile photo uploaded!');
      // window.location.reload()
      setImageSrc(null);
      setFile(null);
    } catch (error) {
      toast.error('Failed to upload photo');
    }
  };
  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result);
    };
    reader.readAsDataURL(uploadedFile);
  };
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/jpeg, image/png, image/jpg', // Only accept image files
    onDrop: handleDrop, // Trigger the handleDrop function when a file is dropped
    maxSize: 5 * 1024 * 1024,
  });

  const handleCropAndUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      toast.error('Please select an image and crop it first.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB.');
      setImageSrc(null);
      return;
    } 
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error('Invalid file type.');
      setImageSrc(null);
      return;
    }

    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels,0.7);
    handleUpload(croppedImage); // Upload the cropped image
  };

  useEffect(() => {
      const fetchTrainer = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/userroute/gettrainer/${userId}`);
          setTrainer(response.data);
        } catch (error) {
          console.error('Error fetching trainer:', error);
        }
      };
      fetchTrainer();
    }, [userId]);

     useEffect(() => {
            const fetchTasks = async () => {
                try {
                    const response = await axios.get(
                        `${process.env.REACT_APP_BACKEND_ROUTE}/trainer/gettasks/${trainer?._id}/${userId}`
                    );
                    setTasks(response.data.tasks || []);
                    const initialCheckedState = response.data.tasks.reduce((acc, task) => {
                        acc[task._id] = task.completed;
                        return acc;
                    }, {});
                    setCheckedTasks(initialCheckedState);
                } catch (error) {
                    console.error('Error fetching tasks:', error);
                   
                }
            };
            if (trainer?._id && userId) fetchTasks();
        }, [trainer, userId]);
    
        const isToday = (taskDate) => {
            const today = new Date();
            const task = new Date(taskDate);
    
            return (
                today.getDate() === task.getDate() &&
                today.getMonth() === task.getMonth() &&
                today.getFullYear() === task.getFullYear()
            );
        };
    
        const filteredTasks = tasks.filter((task) => isToday(task.date));
    
        const calculatemessage=()=>{
            const totaltasks=filteredTasks.length
            const completedtasks=filteredTasks.filter((task)=>task.completed).length
            if(totaltasks===0){
                return 'No tasks assigned '
            }
            if(completedtasks===0){
                return "No tasks completed yet";
            }
            if(completedtasks===totaltasks){
                return "All tasks completed! ";
            }
            
    
            return `${completedtasks}/${totaltasks} tasks completed.`;
        }
        const taskProgress = () => {
          const totaltasks = filteredTasks.length;
          const completedtasks = filteredTasks.filter((task) => task.completed).length;
          if (totaltasks === 0) return 0;
          return (completedtasks / totaltasks) * 100;  // Calculate the percentage of tasks completed
      };


      const handleupdate=async(event)=>{
        event.preventDefault()
        try {

        
          const response=await axios.put(`${process.env.REACT_APP_BACKEND_ROUTE}/userroute/update-physical-details`,{
            userId,height,Weight
          })
          if(response.data.success){
            const heightInMeters = height / 100;
            const calculatedBmi = Weight / (heightInMeters ** 2);
            setBmi(calculatedBmi);

            toast.success('Physical Details updated successfully')  
            setshowModal(false)
           
          }
        } catch (error) {
          toast.error('updation error')
        }
      }

      useEffect(()=>{
        const fetchUserdetails=async()=>{
          try {
            const response=await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/userroute/get-user-details/${userId}`)
            if(response.data.user){
              const userHeight = response.data.user.height;
                const userWeight = response.data.user.weight;

                setHeight(userHeight);
                setWeight(userWeight);

                if (userHeight && userWeight) {
                    const heightInMeters = userHeight / 100;
                    const calculatedBmi = userWeight / (heightInMeters ** 2);
                    setBmi(calculatedBmi);
                }
            }
          } catch (error) {
            console.error('Error fetching user details:', error);
            toast.error('Failed to fetch user details');
          }
        }
        fetchUserdetails()
      },[userId])
     

  return (
    <div className="userprofile">
      <Navbar />
      <ToastContainer />
     <div className="usercontainer">
        <div className="userdetails col-md-6">
          <div className="userphotos m-1" onClick={() => document.getElementById('fileInput').click()}>
          {photoUrl &&(!photoUrl|| !photoUrl.includes('null'))? (
             <div className="photo-container" style={{ position: 'relative' }}>
              <img
                src={photoUrl}
                alt="Profile"
                className='userphoto'
                style={{cursor:'pointer'}}
               
              />
              <div className="hover-text">UPDATE PROFILE</div>
              </div>
            ) : (
               <img
               src={person}
               alt="Profile"
               className='userphoto'
               style={{maxWidth:'3rem',height:'auto',marginTop:'2rem'}}
              
             />   
                   
            )}
          </div>
          <input
            type="file"
            id="fileInput"
            accept="image/jpeg, image/png, image/jpg"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          {imageSrc && (
            <div style={{ position: 'absolute', width: '40%', left: '30%', top: '23%', height: '-webkit-fill-available',zIndex:'9999' }}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
               <Button
                  style={{ background: 'black', color: 'white', fontSize: 'x-small' }}
                  onClick={handleCropAndUpload}
                >
                  Crop and Upload
                </Button>
            </div>
            
          )}
        
          <div className="username m-1">
            <h6 className="mt-3" style={{ textTransform: 'uppercase' }}>
            {lastname ? `${firstname} ${lastname}` : firstname}
            </h6>
            <p>{email}</p>


            {!imageSrc && (!photoUrl || photoUrl.includes('null'))&&(
            <div {...getRootProps()} className="dropzone" style={{marginBottom:'1rem'}}>
            <input {...getInputProps()} />
           <p>Drag & drop a photo here, or click to select a file</p>
           </div>
          )}
          
        
            {trainer?(
              <>
            
                <div style={{marginTop:'1rem',display:'flex',flexDirection:'row',marginLeft:'0rem',marginBottom:'2rem'}}>
               
                <Link to='/premium/chat-with-trainer' style={{textDecoration:'none',color:'black',fontSize:'x-small',letterSpacing:'1px',fontWeight:'500',}}>
                <Button className='' style={{background:'black',color:'white',fontSize:'xx-small'}}>CHAT WITH YOUR TRAINER</Button>
                </Link>
                
              <Link to='/premium/tasks' style={{textDecoration:'none',color:'black',fontSize:'x-small',letterSpacing:'1px',fontWeight:'500',}}>
              <Button className=''style={{background:'black',color:'white',fontSize:'xx-small',marginLeft:'5px'}}>GET TASKS</Button>
              </Link>
          </div>
          <div style={{display:'flex',flexDirection:'row',marginBottom:'-2rem',marginTop:'-1rem'}}>
          <div className="progresshing" >
             
             <WaterFlowProgress progress={taskProgress()}/>
             </div>
             <div>
             <p style={{fontSize:'x-small',letterSpacing:'1px',color:'#493e3e',marginTop:'10px',marginLeft:'-2rem'}}  >{calculatemessage()}</p>
             </div>
             

         
          </div>
              </>
              
            ):(
              <p></p>
            )}

            {/* Dropzone Area */}
            
            {imageSrc && (
              <div style={{ position: 'absolute', width: '40%',left:'30%',top:'23%', height: '-webkit-fill-available',zIndex:'9999' }}>
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                 
                />
                 <Button
                  style={{ background: 'black', color: 'white', fontSize: 'x-small' }}
                  onClick={handleCropAndUpload}
                >
                  Crop and Upload
                </Button>
              </div>
            )}

           
          </div>
          
        </div>
       
        
        <div className="timespend col-md-6" style={{marginLeft:'13rem'}}>
  <div className='row' style={{ margin: '1rem' }}>
    {topworkout.length > 0 ? (
      topworkout.map((workout, index) => {
        // Get the correct image for each workout
        const workoutImage = workoutIcons[workout.workoutName.toLowerCase()] || defaultpic;

        return (
          <div
            key={index}
            className="col-md-6 timecolumn"
            style={{
              background:
                index === 0
                  ? '#A1A4AC'
                  : index === 1
                  ? '#A2A2B5'
                  : index === 2
                  ? '#A7AA99'
                  : index === 3
                  ? '#B4B4B8'
                  : '#07acb654',
            }}
          >
            <div style={{display:'flex',flexDirection:'row'}}>
              <div style={{marginTop:'1rem'}}>
              <img
              src={workoutImage}
              alt={workout.workoutName}
              style={{ width: '30px', height: '30px' }}
            />
              </div>
              <div className='workoutnamede' style={{marginLeft:'1rem'}}>
              <p style={{ fontWeight: '700',marginTop:'1rem' }}>{workout.workoutName}</p>
              <p style={{marginTop:'-15px',fontSize:'x-small'}}>{Math.floor(workout.totalDuration / 60)} MINUTES</p>
              </div>
            </div>
            
          
          </div>
        );
      })

    ) : (
      <p>No top workouts found</p>
    )}
  </div>
   </div> 
      </div>

      <div className="secondrow">
      <div className="row">
        <div className="col-md-6">
       
        <div className="charts-container" style={{marginTop:'1rem'}}>
        <h6 className="" style={{ letterSpacing: '1px', textTransform: 'uppercase',marginLeft:'4rem' }}>
         WORKOUT STATISTICS
        </h6>
       <div className="charts"style={{height:'18rem',marginTop:'1rem'}}>
          <WorkoutBarChart />
        </div>
       </div>
        </div>
        <div className="col-md-6">
          <div className="charts" style={{height:'18rem'}}>
            
            <div className="writings">
            
            <div>
                <BMIChart bmi={bmi}/> 
              
            </div> 
           
          </div>
          <p className='updatestatus' onClick={()=>setshowModal(true)}>update your height and weight here </p>
          {showmodal && (
            <div className="premodal" >
              <div className="premodal-content">
                <h6>update physical details</h6>
                <form onSubmit={handleupdate}>
                  <div>
                    <label htmlFor="height">height(cm)</label>
                    <input type="number" value={height} onChange={(e)=>setHeight(e.target.value)} step='any' required />
                  </div>
                  <div>
                    <label htmlFor="weight">weight(kg)</label>
                    <input type="number" value={Weight} onChange={(e)=>setWeight(e.target.value)} step='any' required />
                  </div>
                  <div className="premodal-actions">
                    <button type='submit'>update</button>
                    <button type='button' onClick={()=>setshowModal(false)}>cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
      </div>
    
        <div className="row ">
       
        
    
        </div>
    </div>
    
    
  );
}

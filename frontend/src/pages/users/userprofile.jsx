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
import person from '../../assets/images/person.png';
import bmi from '../../assets/images/bmi.png'
import defaultpic from '../../assets/images/default.png'
import stat from '../../assets/images/stat.png'


export default function Userprofile() {
  const navigate = useNavigate();
  const { firstname, email, lastname, isAuthenticated, userId } = useSelector((state) => state.user);
  const [file, setFile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [imageSrc, setImageSrc] = useState(null); 
  const [crop, setCrop] = useState({ x: 0, y: 0 }); 
  const [zoom, setZoom] = useState(1); // Zoom level
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [topworkout,setTopWorkout]=useState([])
  
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
      //window.location.reload()
      setImageSrc(null);
      setFile(null);
    } catch (error) {
      toast.error('Failed to upload photo');
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/jpeg, image/png, image/jpg', // Only accept image files
    onDrop: handleDrop, // Trigger the handleDrop function when a file is dropped
    maxSize: 5 * 1024 * 1024, // Max file size 5MB
  });
  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result);
    };
    reader.readAsDataURL(uploadedFile);
  };
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

  return (
    <div className="userprofile">
      <Navbar />
      <ToastContainer />
      <div className="usercontainer">
        <div className="userdetails col-md-4">
          <div className="userphotos m-1" style={{cursor:'pointer'}}  onClick={() => document.getElementById('fileInput').click()}>
            {photoUrl &&(!photoUrl|| !photoUrl.includes('null'))? (
              <img
                src={photoUrl}
                alt="Profile"
                className='userphoto'
               
              />
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
            <div {...getRootProps()} className="dropzone">
          <input {...getInputProps()} />
           <p>Drag & drop a photo here, or click to select a file</p>
           </div>
          )}
            {/* Dropzone Area */}
           

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

            {imageSrc && (
              <div className="mt-2">
               
              </div>
            )}

            {/* Display selected file */}
            {file && (
              <div className="mt-2">
               
              </div>
            )}
          </div>
        </div>
        <div className="timespend col-md-6">
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
        <div className="charts-container">
       <div className="charts blurred">
        <img src={stat} alt="dummyimage" style={{width:'-webkit-fill-available'}} />
        </div>
       <div className="overlay">
        <Link to='/premium' style={{textDecoration:'none'}}>
        <span className="lock-icon" style={{marginLeft:'3rem'}}>🔒</span>
         <p className="premium-text">HAVE PREMIUM</p>
         </Link>
         
        </div>
       </div>
        </div>
        <div className="col-md-6">
          <div className="charts" style={{position:'relative'}}>
          <Link to='/premium' style={{textDecoration:'none',color:'black'}}>
            <div className="background-image-container">
             <img src={bmi} alt="BMI Background" />
            </div>
            <div className="writingsn" style={{position:'relative'}} >

            <h6>TRY OUR PREMIUM MEMBERSHIP</h6>
            <p>Get access to personalized workout plans crafted by expert trainers, 
              nutrition tips tailored to your needs, and exclusive mindfulness sessions
               to help you recharge. With our premiere membership, you’ll benefit from 
               advanced goal tracking, one-on-one guidance, and an ad-free experience, all designed to keep you
               motivated and on track. Join today and take the next step towards a healthier, happier you!</p>
               </div>
               </Link>
          </div>
        
        </div>
      </div>
      </div>
     
    </div>
  );
}

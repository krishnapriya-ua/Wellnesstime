import React, { useState,useRef,useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../../assets/styles/signup.css';
import { TextField, Button } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../assets/styles/joinus.css'
import {useDropzone} from 'react-dropzone'
import Cropper from 'react-easy-crop'
import { getCroppedImg } from './cropperImage';
import {Select,MenuItem,Checkbox,ListItemText} from '@mui/material';

const skillOptions=[
  "Nutrition",
  "Mindfulness & Focus",
  "Focus",
  "Strength Training",
  "Flexibility",
  "Stress Management",
  "Core Strengthening",
  "Posture Alignment",
  "Muscle Building",
  "Weight Loss"
 
]


export default function Joinus() {
  const phoneInputRef = useRef(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phonenumber, setPhoneNumber] = useState('');
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState('');
  const [profilephoto, setProfilePhoto] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  
  const onCropComplete = (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };


  const handleSkillChange=(event)=>{
    const{
      target:{value},
    }=event
    setSkills(typeof value==='string' ?value.split(","):value)

  }
 
  useEffect(() => {
    if (phoneInputRef.current) {
      const iti = window.intlTelInput(phoneInputRef.current, {
        initialCountry: "in",
        separateDialCode: true,
        utilsScript:
          "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
      });

      return () => iti.destroy();
    }
  }, []);

  // Validate email format
  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);




  const onDrop=(acceptedFiles)=>{
    if(acceptedFiles.length>0){
      const file=acceptedFiles[0]
      if ( file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB.');
        setProfilePhoto(null);
        return;
      }
      if (file && !['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        toast.error('Invalid file type. Only JPEG and PNG are allowed.');
        setProfilePhoto(null);
        return;
      }
      setProfilePhoto(file);
      setCroppedImage(null)

    }
    
  }

  const {getRootProps,getInputProps,isDragActive}=useDropzone({
    onDrop,
    accept:'image/*',
    maxFiles:1,
  })



  const cropImage=async()=>{
    try {
      const cropped = await getCroppedImg(
        URL.createObjectURL(profilephoto),
        croppedAreaPixels
      );
      setCroppedImage(cropped);
      toast.success('Image cropped successfully!');
      setProfilePhoto(null)
    } catch (error) {
      toast.error('Failed to crop image.');
    }

  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email||!name||!experience) {
      toast.error('All fields are necessary');
      return;
    }
    if (!isValidEmail(email)) {
      toast.error('Invalid email format.');
      return;
    }
    if (!Array.isArray(skills) || skills.length === 0) {
      toast.error("Please select at least one skill");
      return;
    }
    if (!profilephoto&&!croppedImage) {
      toast.error('Profile photo is required.');
      return;
    }
   
    if(email.trim()===''){
      toast.error('Email should not have empty spaces')
      return
    }
    if(name.trim()===''||name.trim().length<3){
      toast.error('Name should have atleast 3 characters')
      return
    }
   
    if(experience.trim()===''){
      toast.error('Experience cannot be empty')
      return
    }

    const phoneInput = phoneInputRef.current;
    const intlInputInstance = window.intlTelInputGlobals.getInstance(phoneInput);
  
    if (intlInputInstance) {
      const fullNumber = intlInputInstance.getNumber();
      const isValid = intlInputInstance.isValidNumber();
  
      if (!isValid) {
      
        toast.error("Invalid phone number. Please try again.");
        
        return;
      }
  

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phonenumber', fullNumber);
    formData.append('skills', skills);
    formData.append('experience', experience);
    if (croppedImage) {
      const blob = await fetch(croppedImage).then((res) => res.blob());
      formData.append('photo', blob, 'cropped-image.png');
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/trainer`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    
      if (response.data.success) {
        toast.success(response.data.message);
   
      } else {
        toast.error(response.data.message || 'An error occurred.');
     
      }
    
      setName('');
      setEmail('');
      setPhoneNumber('');
      setSkills([]);
      setExperience('');
      setProfilePhoto(null);
      setCroppedImage(null)
      intlInputInstance.setNumber(""); 


    } catch (error) {
      toast.error(error.response?.data?.message||'Failed to submit application!');
      
    }
  }
  };

  return (
    <div className="container my-5">
       <div className="backp d-flex mb-0 align-items-start justify-content-between">
        <Link style={{ color: '#000000ab', fontSize: 'small' }} to="/premium">
          <p> BACK</p>
        </Link>
       
      </div>
      <div className="text-center mb-2">
        <h5 className="headI text-center mt-5">JOIN US AS A TRAINER</h5>
      </div>
      <div className="row align-items-start justify-content-between">
        <div className="col-12 col-lg-12 p-3 m-0">
          <form className="formi" onSubmit={handleSubmit} noValidate>
            <label htmlFor="name" className="mb-3">NAME</label>
            <TextField
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="standard"
              className="text mb-3"
              fullWidth
              required
            />

            <label htmlFor="Email" className="mb-3">EMAIL</label>
            <TextField
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="standard"
              className="text mb-3"
              fullWidth
              required
            />

            <label className="mb-3">PHONE NUMBER</label> <br />
           
             <input
                id="phone"
                type="tel"
                ref={phoneInputRef}
                className="custom-input mb-4"
                placeholder="Phone number"
                style={{
                  width: '159%',
                  border: 'none',
                  borderBottom: '1px solid #ccc',
                  outline: 'none',
                  padding: '8px 0',
                  fontSize: '16px',
                  background: 'transparent'
                }}
                required
              />
            <br />
            <label htmlFor="skills" className="mb-3">SKILLS</label>
            <Select
            multiple
              value={skills}
             
              onChange={handleSkillChange}
              renderValue={(selected)=>selected.join(",")}
              variant="standard"
              className="text mb-3"
              fullWidth
              required
            >
              {skillOptions.map((skill)=>(
                <MenuItem key={skill} value={skill}>
                  <Checkbox checked={skills.indexOf(skill)>-1}/>
                    <ListItemText primary={skill} />
                </MenuItem>
              ))}
            </Select>

            <label htmlFor="experiences" className="mb-3">EXPERIENCES</label>
            <TextField
              variant="standard"
              placeholder="Experiences"
              className="text mb-3"
              fullWidth
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              required
            />

            <label htmlFor="photo">PROFILE PHOTO</label>
            <div  {...getRootProps()}
            style={{
              border: '2px dashed #ccc',
              borderRadius: '10px',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}>
               <input className="mb-3" name="photo" {...getInputProps()} required />
               {isDragActive?(
                <p>Drag the photo here </p>):(
                 <p>Drag & drop a photo here, or click to select one</p>
                )
               }

            </div>
            {profilephoto&&!croppedImage &&(
               <div style={{ position: 'relative', width: '100%', height: '400px' }}>
               <Cropper
                 image={URL.createObjectURL(profilephoto)}
                crop={crop}
                 zoom={zoom}
                 aspect={1}
                 onCropChange={setCrop}
                 onCropComplete={onCropComplete}
                 onZoomChange={setZoom}
               />
                 <Button variant="contained" onClick={cropImage} className="mt-2">
                  Crop
                </Button>
             </div>
             
            )}
          
          {croppedImage && <img src={croppedImage} alt="Cropped" style={{ width: '60%',marginLeft:'0rem', marginTop: '10px' }} />}
            <Button variant="contained" className="button mb-3" fullWidth type="submit">
              SUBMIT
            </Button>
               </form>
        </div>
      </div>

     <ToastContainer/>
    </div>
  );
}

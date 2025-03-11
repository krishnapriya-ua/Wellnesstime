import React, { useState,useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import '../../assets/styles/premium-member.css'
import { Navbar } from './navbar';
import { TextField,FormControl,MenuItem,Select } from '@mui/material';
//import { useDispatch } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
export default function Premiummember() {

    const { firstname, premium, userId } = useSelector((state) => state.user);
    const [ispremium,setIsPremium]=useState(false)
    const [formData, setFormData] = useState({
        preferences: [],
        goals: [],
        height: '',
        weight: '',
        sleepSchedule: '',
        diet: '',
    });

  
   useEffect(()=>{
    const verifyPremium=async()=>{
        try {
            const response=await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/userroute/getpremium`)
            const premiumusers=response.data

            const currentuser=premiumusers.find((user)=>user._id===userId)
            if(currentuser){
                setIsPremium(true)

            }
            else{
                setIsPremium(false)
            }
        } catch (error) {
            console.log(error)
            toast.error('error fetching premium user')
        }
    }
    verifyPremium()
   },[userId])

    const handleCheckboxChange = (e, section) => {
        const value = e.target.value;
        setFormData((prevData) => {
            const updatedList = prevData[section].includes(value)
                ? prevData[section].filter((item) => item !== value)
                : [...prevData[section], value];
            return { ...prevData, [section]: updatedList };
        });
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const { preferences, goals, height, weight, diet, sleepSchedule } = formData;
        if (preferences.length === 0 || goals.length === 0 || !height || !weight || !sleepSchedule || !diet) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please fill out all the fields before submitting!',
            });
            return;
        }
        try {
            // Submit the user details
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/userroute/premium-details`, { userId, ...formData });
            await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/trainer/match-trainer`, { userId });
    
          
            Swal.fire({
                icon: 'success',
                title: 'Request Submitted',
                text: 'Your request has been taken to the list. We will let you know when a trainer matches with you.',
                timer:4000,
               showConfirmButton:false
            }).then(() => {
               
                window.location.href = '/premium-userprofile'; 
            });
    
            // Reset form
            setFormData({
                preferences: [],
                goals: [],
                height: '',
                weight: '',
                sleepSchedule: '',
                diet: '',
            });
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Something went wrong!',
            });
        }
    };
    
    return (
        <div className="height" >
            <Navbar/>
            <ToastContainer/>
            {ispremium ? (
                <div className="m-5 premiu-little">
                    <div className="mb-4">
                        <h5 className=" p-1 mb-3" style={{ letterSpacing: '4px',textTransform:'uppercase' }}>
                            HELLO {firstname}
                        </h5>
                        <p className="mb-5" style={{ width: '50%', color: '#000000b8' }}>
                            Just a little more steps to follow then we can explore the paths of 
                            premiere wellness time!
                        </p>
                    </div>

                    <div className="form-sections d-flex justify-content-between">
                        {/* Workouts preferences */}
                        <div className="workout-preferences">
                            <h6 className='mb-3'>WHAT KIND OF WORKOUTS YOU PREFER MOST?</h6>
                            <div>
                            
                                <label>
                                    <input
                                        type="checkbox"
                                        value="Cardio"
                                        onChange={(e) => handleCheckboxChange(e, 'preferences')}
                                    />
                                    Cardio
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        value="Weight Training"
                                        onChange={(e) => handleCheckboxChange(e, 'preferences')}
                                    />
                                    Weight Training
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        value="Meditation"
                                        onChange={(e) => handleCheckboxChange(e, 'preferences')}
                                    />
                                    Meditation
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        value="Calisthenics"
                                        onChange={(e) => handleCheckboxChange(e, 'preferences')}
                                    />
                                    Calisthenics
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        value="Yoga"
                                        onChange={(e) => handleCheckboxChange(e, 'preferences')}
                                    />
                                    Yoga
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        value="Pilates"
                                        onChange={(e) => handleCheckboxChange(e, 'preferences')}
                                    />
                                    Pilates
                                </label>
                              
                            </div>
                        </div>

                        {/* Main goals section */}
                        <div className="main-goals">
                            <h6 className='mb-3'>WHAT IS YOUR MAIN MOTIVE OF CHOOSING WELLNESS TIME?</h6>
                            <div>
                         
                                <label>
                                    <input
                                        type="checkbox"
                                        value="Nutrition"
                                        onChange={(e) => handleCheckboxChange(e, 'goals')}
                                    />
                                    Nutrition
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        value="Mindfulness & Focus"
                                        onChange={(e) => handleCheckboxChange(e, 'goals')}
                                    />
                                    Mindfulness & Focus
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        value="Strength Training"
                                        onChange={(e) => handleCheckboxChange(e, 'goals')}
                                    />
                                    Strength Training
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        value="Stress Management"
                                        onChange={(e) => handleCheckboxChange(e, 'goals')}
                                    />
                                    Stress Management
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        value="Flexibility"
                                        onChange={(e) => handleCheckboxChange(e, 'goals')}
                                    />
                                    Flexibility
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        value="Core Strengthening"
                                        onChange={(e) => handleCheckboxChange(e, 'goals')}
                                    />
                                    Core Strengthening
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        value="Posture Alignment"
                                        onChange={(e) => handleCheckboxChange(e, 'goals')}
                                    />
                                    Posture Alignment
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        value="Muscle Building"
                                        onChange={(e) => handleCheckboxChange(e, 'goals')}
                                    />
                                   Muscle Building
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        value="Weight Loss"
                                        onChange={(e) => handleCheckboxChange(e, 'goals')}
                                    />
                                    Weight Loss
                                </label>
                              
                            </div>
                        </div>

                        {/* Form section for additional info */}
                        <div className="additional-info mb-3">
                            <h6>PLEASE FILL THIS FORM</h6> <br />
                            <form onSubmit={handleSubmit}>
                                <label>Height (in cms)</label> <br />
                                <TextField
                                    type="number"
                                    name="height"
                                   
                                    value={formData.height}
                                    onChange={handleInputChange}
                                    variant='standard'
                                    inputProps={{
                                        step:'0.01'

                                    }}
                                /> <br />

                                <br /><label>Weight(in kg)</label> <br />
                                <TextField
                                    type="number"
                                    name="weight"
                                   
                                    value={formData.weight}
                                    onChange={handleInputChange}
                                    variant='standard'
                                    inputProps={{
                                        step:'0.01'

                                    }}
                                /> <br />

                                 <br /><label>Sleep Schedule Time</label> <br />
                                <TextField
                                    type="text"
                                    name="sleepSchedule"
                                   
                                    value={formData.sleepSchedule}
                                    onChange={handleInputChange}
                                    variant='standard'
                                /> <br />

                                <br /> <label>Veg / Non Veg</label> <br />
                                <FormControl variant="standard" fullWidth>
 
                                 <Select
                                  name="diet"
                                  value={formData.diet}
                                 onChange={handleInputChange}
                                 style={{width:'68%'}}
                                  >
                                  <MenuItem value="Veg">Veg</MenuItem>
                                 <MenuItem value="Non-Veg">Non-Veg</MenuItem>
                                  </Select>
                                </FormControl>
                                <br />
                                <button className='prebu' type="submit">Submit</button>
                            </form>
                        </div>
                    </div>

                    {/* Bottom text */}
                    <div className="great mb-4" style={{width:'60%',marginTop:'6rem'}}>
                        <h5 className='mt-4 mb-2'>GREAT!!</h5>
                        <p style={{letterSpacing:'1px',fontSize:'small'}}>
                            Based on your preferences and goals, we will match you with a trainer 
                            that best fits your needs. We will let you know who will be your trainer shortly!
                            They will reach out to you within one day to discuss your personalized wellness plan 
                            and get you started on your journey!
                        </p>
                    </div>
                </div>
            ) : (
                <h6>Hey {firstname}, please have a premium membership first to explore the premium offers</h6>
            )}
        </div>
    );
}

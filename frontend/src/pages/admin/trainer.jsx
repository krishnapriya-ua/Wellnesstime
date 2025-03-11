import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminNavbar } from './admin-nav';
import '../../assets/styles/workout.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from '@mui/material';
import TablePagination from '@mui/material/TablePagination';
import '../../assets/styles/trainer.css'
import Cropper from 'react-easy-crop'
import { getCroppedImg } from '../users/cropperImage';
import {Select,MenuItem,Checkbox,ListItemText} from '@mui/material';
import { useSelector } from 'react-redux';
const skillOptions = [
  "Nutrition",
  "Mindfulness & Focus",
  "Focus",
  "Strength Training",
  "Flexibility",
  "Stress Management",
  "Core Strengthening",
  "Posture Alignment",
  "Muscle Building",
  "Weight Loss",
];

export default function Trainer() {
  const [trainers, setTrainers] = useState([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', email: '',phonenumber:'',skills: [],experience:'', profilephoto: null });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);  // Store the image source for cropping
  const [croppedImage, setCroppedImage] = useState(null);


  const trainerId=useSelector((state)=>state.trainer.trainerId)
  const [clients,setClients]=useState([])


  const onCropComplete = (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  useEffect(() => {
    fetchTrainers();
  }, [page,rowsPerPage]);

  const fetchTrainers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/listtrainer`);
      setTrainers(response.data);
    } catch (error) {
      toast.error('Error fetching trainers');
    }
  };


  const handleCrop = async () => {
    if (croppedAreaPixels && imageSrc) {
      const croppedImg = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedImage(croppedImg);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleSkillChange = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill) // Remove if already selected
        : [...prev.skills, skill], // Add if not selected
    }));
  };
  

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e, isEdit = false) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('skills', formData.skills);

    data.append('phonenumber',formData.phonenumber)
    data.append('experience',formData.experience)
    if (croppedAreaPixels && imageSrc) {
      
      const blob = await fetch(croppedImage).then((res) => res.blob());
      data.append('photo', blob, 'profilephoto.png');
    }
    try {
      if (isEdit) {
        await axios.put(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/edittrainer/${formData.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Trainer updated successfully!');
      } else {
        await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/addtrainer`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Trainer added successfully!');
      }
      setFormData({ id: '', name: '', email: '', skills: '',phonenumber:'',experience:'', profilephoto: null });
      setShowAddModal(false);
      setShowEditModal(false);
      fetchTrainers();
    } catch (error) {
      toast.error(error.response?.data?.message||'Failed to save trainer!');
    }
  };
  const getClientNameById = (id) => {
    const client = clients.find(client => client.id === id); // allClients is an array of client objects
    return client ? client.name : 'Unknown';
  };
  
  const handleEdit = (trainer) => {
    setFormData({
      id: trainer._id,
      name: trainer.name,
      email: trainer.email,
      skills: trainer.skills||[],
      phonenumber:trainer.phonenumber,
      experience:trainer.experience,
      profilephoto: null,
    });
    setShowEditModal(true);
  };

  const handleDelete = (id) => {
    toast.info(
      <div>
        <p>Are you sure you want to delete this trainer?</p>
        <Button
          className="delete"
          onClick={async () => {
            try {
              await axios.delete(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/deletetrainer/${id}`);
              fetchTrainers();
              toast.dismiss();
              toast.success('Trainer deleted successfully!');
            } catch (error) {
              toast.error('Failed to delete trainer');
            }
          }}
        >
          Confirm
        </Button>
        <Button style={{ marginLeft: '5px' }} className="edit" onClick={() => toast.dismiss()}>
          Cancel
        </Button>
      </div>,
      { autoClose: false }
    );
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page when changing rows per page
  };
 
  const displayedWorkouts = trainers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);


   
  return (
    <div className="admin-container">
      <AdminNavbar />
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h4 className="headn" style={{ fontSize: '1rem' }}>TRAINER MANAGEMENT</h4>
          <Button
            onClick={() => {
              setFormData({ id: '', name: '', email: '', skills: '',experience:'',phonenumber:'',profilephoto: null });
              setShowAddModal(true);
            }}
            className="edit"
          >
            Add Trainer
          </Button>
        </div>

        <div className="workout-table-container mt-5">
  <table className="workout-tablet ">
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Phone Number</th>
        <th style={{width:'15rem'}}>Experience</th>
        <th>Skills</th>
        <th>Profile Photo</th>
        <th>Clients</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {trainers.map((trainer) => (
        <tr key={trainer._id}>
          <td>{trainer.name}</td>
          <td>{trainer.email}</td>
          <td>{trainer.phonenumber}</td>
          <td>{trainer.experience}</td>
         
          <td>
          {Array.isArray(trainer.skills) ? trainer.skills.join(", ") : trainer.skills}</td>
          <td>
            {trainer.profilephoto && (
              <img
                style={{ maxWidth: '80px' }}
                src={`${process.env.REACT_APP_BACKEND_ROUTE}/${trainer.profilephoto}`}
                alt="trainer"
              />
            )}
          </td>
          <td> {trainer.clients.length > 0 ? (
            trainer.clients.map((client, index) => (
           <span style={{textTransform:'uppercase'}} key={client._id}> {client.firstname || 'none'}
           {index < trainer.clients.length - 1 ? ', ' : ''}
          </span>
          ))
         ) : (
        <span>none</span>
        )}
       </td>


          <td>
            <Button className="edit" onClick={() => handleEdit(trainer)}>
              Edit
            </Button>
            <Button
              style={{ marginLeft: '8px' }}
              className="delete"
              onClick={() => handleDelete(trainer._id)}
            >
              Delete
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

        <TablePagination
              count={trainers.length}
              page={page}
             onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
             labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
          />
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" >
            <h6 style={{marginLeft:'1rem'}}>ADD TRAINER</h6>
            <form onSubmit={(e) => handleSubmit(e)}>
              <input
              className='form-control workout-input'
                type="text"
                name="name"
                placeholder="Trainer Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
              className='form-control workout-input'
                type="email"
                name="email"
                placeholder="Trainer Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
               <input
               className=' form-control workout-input'
                type="text"
                name="phonenumber"
                placeholder="Trainer phonenumber"
                value={formData.phonenumber}
                onChange={handleChange}
                required
              />
               <p  style={{width:'86%',marginLeft:'18px',marginRight:'11px',marginTop:'11px',marginBottom:'12px'}}>Skills</p>
            
               <div
          style={{
            maxHeight: '120px', // Limit height of the skills section
            overflowY: 'scroll', // Enable vertical scrolling
            border: '1px solid #ccc', // Optional: Add border for better visibility
            padding: '10px', // Optional: Add some padding
            margin: '0 18px 12px',
            scrollbarWidth:'none', 
            width:'86%'// Align with existing margin styles
          }}
        >

             {skillOptions.map((skill) => (
             <label key={skill} style={{ marginBottom: '10px',display:'block',fontSize:'small' }}>
             
              <input
               style={{marginLeft:'18px',fontSize:'x-small',marginBottom:'2px'}}
                type="checkbox"
               value={skill}
               checked={formData.skills.includes(skill)}
               onChange={() => handleSkillChange(skill)}
              />
             {skill}
               </label>
             ))}
             </div>
             <textarea
               className='form-control workout-input'
                name="experience"
                placeholder="Experiences"
                value={formData.experience}
                onChange={handleChange}
                required
                style={{width:'53%',marginLeft:'11px'}}
              />
              <input type="file"  style={{marginLeft:'11px'}} name="photo" onChange={handleFileChange} />
              {imageSrc && !croppedImage &&(
                <div style={{ position: 'relative', width: '100%', height: '400px' }}>
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    style={{marginBottom:'4rem'}}
                  />
                   <Button
                style={{ marginTop: '10px' }}
                variant="contained"
                onClick={handleCrop}
              >
                Crop
              </Button>
             

                </div>
              )}
               {croppedImage && (
           <div>
            
           <img src={croppedImage} style={{maxWidth:'100px',marginLeft:'11px'}} alt="Cropped Preview" />
            </div>
           )}
               
              <div style={{ marginTop: '10px' }}>
                <Button  style={{ marginLeft: '11px' }} type="submit" className="edit">Submit</Button>
                <Button
                  style={{ marginLeft: '11px' }}
                  className="delete"
                  onClick={() => setShowAddModal(false)}
                >
                  Close
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" >
          <div className="modal-content">
            <h6 style={{marginLeft:'1rem'}}>EDIT TRAINER</h6>
            <form onSubmit={(e) => handleSubmit(e, true)} style={{fontSize:'small'}}>
              <input
              className='form-control workout-input'
                type="text"
                name="name"
                placeholder="Trainer Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
              className='form-control workout-input'
                type="email"
                name="email"
                placeholder="Trainer Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
               <input
               className='form-control workout-input'
                type="text"
                name="phonenumber"
                placeholder="Trainer Number"
                value={formData.phonenumber}
                onChange={handleChange}
                required
                style={{marginBottom:'5px'}}
              />
               <p  style={{width:'86%',marginLeft:'11px',marginTop:'11px',marginBottom:'12px'}}>Skills</p>
               <div
          style={{
            maxHeight: '120px', // Limit height of the skills section
            overflowY: 'scroll', // Enable vertical scrolling
            border: '1px solid #ccc', // Optional: Add border for better visibility
            padding: '10px', // Optional: Add some padding
            margin: '0 18px 12px',
            scrollbarWidth:'none', 
            width:'86%'// Align with existing margin styles
          }}
        >
            
             {skillOptions.map((skill) => (
             <label key={skill} style={{ marginBottom: '10px',display:'block' }}>
             
              <input
               style={{marginLeft:'11px',marginBottom:'2px'}}
                type="checkbox"
               value={skill}
               checked={formData.skills.includes(skill)}
               onChange={() => handleSkillChange(skill)}
              />
             {skill}
               </label>
             ))}
             </div>

               <textarea
                className='form-control workout-input'
                name="experience"
                placeholder="Experiences"
                value={formData.experience}
                onChange={handleChange}
                required
                style={{width:'86%',marginLeft:'11px',marginBottom:'2px'}}
              />
             
              <input type="file"  style={{marginLeft:'11px'}} name="photo" onChange={handleFileChange} />
              {imageSrc && !croppedImage &&(
                <div style={{ position: 'relative', width: '100%', height: '400px' }}>
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    style={{marginBottom:'4rem'}}
                  />
                   <Button
                style={{ marginTop: '10px' }}
                variant="contained"
                onClick={handleCrop}
              >
                Crop
              </Button>
             

                </div>
              )}
               {croppedImage && (
           <div>
             
           <img src={croppedImage} style={{maxWidth:'100px',marginLeft:'11px'}} alt="Cropped Preview" />;
            </div>
           )}
               
              <div style={{ marginTop: '10px' }}>
                <Button style={{ marginLeft: '11px' }} type="submit" className="edit">Update</Button>
                <Button
                  style={{ marginLeft: '11px' }}
                  className="delete"
                  onClick={() => setShowEditModal(false)}
                >
                  Close
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ToastContainer/>
    </div>
  );
}

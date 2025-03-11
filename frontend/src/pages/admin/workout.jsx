import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminNavbar } from './admin-nav';
import '../../assets/styles/workout.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from '@mui/material';
import TablePagination from '@mui/material/TablePagination';
import '../../assets/styles/trainer.css'
export default function Workout() {
  const [workouts, setWorkouts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', description: '', photos: [] });
  const [expanded, setExpanded] = useState({}); // Track which descriptions are expanded
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm) {
        fetchFilteredWorkouts(searchTerm);
      } else {
        fetchWorkouts(); // Fetch all workouts when the search term is cleared
      }
    }, 500); // 500ms debounce delay
  
    return () => clearTimeout(delayDebounce); // Cleanup timeout
  }, [searchTerm]);
  
  const fetchFilteredWorkouts = async (term) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/listworkout?search=${term}&page=${page}&limit=${rowsPerPage}`);
      setWorkouts(response.data.workouts);
      
    } catch (error) {
      console.error('Error fetching filtered workouts:', error);
    }
  };
  
 

  useEffect(() => {
    fetchWorkouts();
  },  [page,rowsPerPage]);

  const fetchWorkouts = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/listworkout`);
      setWorkouts(response.data.workouts);
   
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles=[];
  
    for (let file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB.');
        return; // Prevent setting invalid files
      }
  
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        toast.error('Invalid file type.');
        return; // Prevent setting invalid files
      }
      validFiles.push(file)
    }
  
    setFormData({ ...formData, photos:validFiles }); // Set valid files
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!formData.name||!formData.description||(!isEditing&&formData.photos.length===0)){
      toast.error('All fields are requried')
      return
    }
    if(formData.photos.length>4){
      toast.error('You can only upload maximum 4 photos.')
      return
    }
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);

    if (formData.photos.length > 0) {
      for (let file of formData.photos) {
        data.append('photos', file);
      }
    }
    try {
     
      if (isEditing) {
        await axios.put(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/workout/${formData.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Workout updated successfully!');
      } else {
        await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/workout`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Workout added successfully!');
      }
      setFormData({ id: '', name: '', description: '', photos: [] });
      setShowModal(false);
      setIsEditing(false);
      fetchWorkouts();
    } catch (error) {
      console.error('Error saving workout:', error.message || error);
      toast.error(error.response?.data.message ||'Failed to save workout!');
    }
  };

  const handleEdit = (workout) => {
    setFormData({
      id: workout._id,
      name: workout.name,
      description: workout.description,
      photos: [], // Reset photos as new ones might be uploaded
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    toast.info(
      <div>
        <p>Are you sure you want to delete this workout?</p>
        <Button
        className='delete'
          onClick={async () => {
            try {
              await axios.delete(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/workout/${id}`);
              fetchWorkouts();
              toast.dismiss();
              toast.success('Workout deleted successfully!');
            } catch (error) {
              console.error('Error deleting workout:', error);
              toast.error('Failed to delete workout.');
            }
          }}
        >
          Confirm
        </Button>
        <Button style={{marginLeft:'5px'}} className='edit' onClick={() => toast.dismiss()}>Cancel</Button>
      </div>,
      { autoClose: false }
    );
  };

  const toggleExpanded = (id) => {
    setExpanded((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };
  // Handle pagination
 
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page when changing rows per page
  };
 
  const displayedWorkouts = workouts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="admin-container">
      <AdminNavbar />
      <div className="main-content" >
        <div style={{display:'flex',justifyContent:'space-between'}}>
        <h4 className='headn' style={{fontSize:'1rem'}}>WORKOUT DASHBOARD  </h4>
       
            <Button onClick={() => setShowModal(true)} className="edit">
          Add Workout
        </Button>
        
        </div>
        <input  type="text" placeholder="Search workouts..." value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           className="search-input"
            style={{padding: '8px',borderRadius: '4px',border: '1px solid #ccc',width: '50%', }}/>
   
       
        <table className="workout-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Photos</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {workouts.map((workout) => (
              <tr key={workout._id}>
                <td>{workout.name}</td>
                <td>
                  {expanded[workout._id]
                    ? workout.description
                    : `${workout.description.slice(0, 50)}...`}
                  <Button
                    className="edit toggle-btn"
                    onClick={() => toggleExpanded(workout._id)}
                  >
                    {expanded[workout._id] ? 'Show Less' : 'Show More'}
                  </Button>
                </td>
                <td style={{display:'flex',gap:'1rem'}}>
                  {workout.photos.map((photo, index) => (
                    <img style={{marginTop:'1rem',height:'72px'}} key={index} src={`${process.env.REACT_APP_BACKEND_ROUTE}/${photo}`} alt="Workout" width="50" />
                  ))}
                </td>
                <td>
                  <Button className='edit' onClick={() => handleEdit(workout)}>Edit</Button>
                  <Button style={{marginLeft:'8px'}} className='delete' onClick={() => handleDelete(workout._id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <TablePagination
              count={workouts.length}
              page={page}
             onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
             labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
          />

      </div>
      

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h6 className='mb-2'>{isEditing ? 'EDIT WORKOUT' : 'ADD WORKOUT'}</h6>
            <form onSubmit={handleSubmit} noValidate>
              <input
              className='workout-input'
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
               className='workout-input'
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                required
              />
              <input  className='workout-input' type="file" name="photos" multiple onChange={handleFileChange} />
              <div className="modal-actions">
                <Button className='edit' style={{marginLeft:'10px'}} type="submit">Save</Button>
                <Button className='delete'  type="button" onClick={() => { setShowModal(false); setIsEditing(false); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

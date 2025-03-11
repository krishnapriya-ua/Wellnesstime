import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminNavbar } from './admin-nav';
import '../../assets/styles/workout.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from '@mui/material';

import DataTable from 'react-data-table-component';
export default function Music() {
  const[categories,setCategories]=useState([])
  const [musiclist, setMusicList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', category: [], musicFiles: [] });

  useEffect(() => {
    fetchMusic();
    fetchCategories();
  }, []);

  const fetchMusic = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/listmusic`);
      setMusicList(response.data);
    } catch (error) {
      toast.error('Error fetching music');
    }
  };

  const fetchCategories=async()=>{
    try {
        const response=await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/getcategories`)
        setCategories(response.data)
    } catch (error) {
        toast.error('error fetching categories')
    }
  }

  const handleChange = (e) => {
    const { name, value,options } = e.target;
    if(e.target.multiple){
       const selectedValues=Array.from(options)
         .filter((option)=>option.selected)
         .map((option)=>option.value)
         setFormData({...formData,[name]:selectedValues})
    }else{
        setFormData({ ...formData, [name]: value });
    }
    
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4'];
  
    for (let file of files) {
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type. Only MP3, WAV, and MP4 are allowed.');
        return;
      }
    }
  
    setFormData({ ...formData, musicFiles: files });
  };
  

  const handleSubmit = async (e, isEdit = false) => {
    e.preventDefault();
    if(!formData.name||!formData.category||(!isEdit&&formData.musicFiles.length===0)){
      toast.error('All feilds are required')
      return
    }
    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    if (formData.musicFiles.length > 0) {
      for (let file of formData.musicFiles) {
        data.append('music', file);
      }
    }

    try {
      if (isEdit) {
        await axios.put(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/music/${formData.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Music updated successfully!');
        setTimeout(() => {
          window.location.reload()  
        }, 1000);
        
      } else {
        await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/addmusic`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Music added successfully!');
      }
      setFormData({ id: '', name: '', category: '', musicFiles: [] });
      setShowAddModal(false);
      setShowEditModal(false);
      await fetchMusic();
     
      
    } catch (error) {
      toast.error('Failed to save music!');
    }
  };

  const handleEdit = (music) => {
    setFormData({
      id: music._id,
      name: music.name,
      category: music.category,
      musicFiles: [],
    });
    setShowEditModal(true);
  };

  const handleDelete = (id) => {
    toast.info(
      <div>
        <p>Are you sure you want to delete this music?</p>
        <Button
          className="delete"
          onClick={async () => {
            try {
              await axios.delete(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/music/${id}`);
              fetchMusic();
              toast.dismiss();
              toast.success('Music deleted successfully!');
            } catch (error) {
              toast.error('Failed to delete music.');
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
  const columns = [
    {
      name: 'Name',
      selector: (row) => row.name,
      sortable: true,
      
    },
    {
      name: 'Categories',
      selector: (row) => row.category.join(', '),
      sortable: true,
    },
    {
      name: 'MusicFiles',
      cell: (row) =>
        row.files.map((file, index) => (
          <audio key={index} controls>
            <source src={`${process.env.REACT_APP_BACKEND_ROUTE}/${file}`} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        )),
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div>
          <Button className="edit" onClick={() => handleEdit(row)}>
            Edit
          </Button>
          <Button
            style={{ marginLeft: '8px' }}
            className="delete"
            onClick={() => handleDelete(row._id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

const customStyles = {
  headRow: {
    style: {
      backgroundColor: '#f4f4f4',
      fontWeight: 'bold',
      color: '#333',
      paddingLeft:'1rem'
    },
  },
  rows: {
    style: {
      backgroundColor: '#fff',
      '&:hover': {
        backgroundColor: '#f9f9f9',
      },
    },
  },
  pagination: {
    style: {
      color: '#333',
    },
  },
};

  return (
    <div className="admin-container">
      <AdminNavbar />
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h4 className="headn" style={{ fontSize: '1rem' }}>
            MUSIC DASHBOARD
          </h4>

          <Button
            onClick={() => {
              setFormData({ id: '', name: '', category: '', musicFiles: [] });
              setShowAddModal(true);
            }}
            className="edit"
          >
            Add Music
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={musiclist}
          pagination
          highlightOnHover
          responsive
          customStyles={customStyles}
          striped
        />
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h6>ADD MUSIC</h6>
            <form onSubmit={(e) => handleSubmit(e, false)} noValidate>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
             <div style={{fontSize:'small'}}>
      <p style={{marginTop:'12px'}}>Select Categories:</p>
      {categories.map((category) => (
        <label key={category._id} style={{ display: 'block', marginBottom: '5px' }}>
          <input
            type="checkbox"
            name="category"
            value={category.name}
            checked={formData.category.includes(category.name)}
            onChange={(e) => {
              const newCategories = e.target.checked
                ? [...formData.category, category.name]
                : formData.category.filter((c) => c !== category.name);
              setFormData({ ...formData, category: newCategories });
            }}
          />
          {category.name}
        </label>
      ))}
    </div>
              <input style={{marginTop:'11px'}} type="file" name="music" multiple onChange={handleFileChange} required />
              <div className="modal-actions">
                <Button className="edit" type="submit">
                  Save
                </Button>
                <Button
                  className="delete"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h6>EDIT MUSIC</h6>
            <form onSubmit={(e) => handleSubmit(e, true)} noValidate>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <div style={{fontSize:'small'}}>
      <p style={{marginTop:'12px'}}>Select Categories:</p>
      {categories.map((category) => (
        <label key={category._id} style={{ display: 'block', marginBottom: '5px' }}>
          <input
            style={{marginLeft:'5px'}}
            type="checkbox"
            name="category"
            value={category.name}
            checked={formData.category.includes(category.name)}
            onChange={(e) => {
              const newCategories = e.target.checked
                ? [...formData.category, category.name]
                : formData.category.filter((c) => c !== category.name);
              setFormData({ ...formData, category: newCategories });
            }}
          />
          {category.name}
        </label>
       ))}
         </div>
              <input style={{marginTop:'12px'}} type="file" name="music" multiple onChange={handleFileChange} />
              <div className="modal-actions">
                <Button className="edit" type="submit">
                  Save
                </Button>
                <Button
                  className="delete"
                  type="button"
                  onClick={() => setShowEditModal(false)}
                >
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

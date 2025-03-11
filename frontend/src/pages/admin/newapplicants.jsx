import React, { useEffect, useState } from 'react';
import { AdminNavbar } from './admin-nav';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Material UI check icon
import CancelIcon from '@mui/icons-material/Cancel'; // Material UI cancel icon
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CircularProgress from '@mui/material/CircularProgress'; // Import CircularProgress for the loading spinner

export default function Newapplicants() {
  const [applicants, setApplicants] = useState([]);
  const [error, setError] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state for status update request
  
  // Fetch new applicants
  const fetchApplicants = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/applicants`);
      setApplicants(response.data);
    } catch (error) {
      setError('Failed to load applicants');
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);
  
  // Handle status update (accept or reject)
  const handleStatusChange = async (applicantId, status) => {
    setLoading(true); // Set loading to true when status is being updated
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/update-status`, {
        applicantId,
        status,
      });
      // On success, refetch the applicants to update the UI
      fetchApplicants();
      toast.success(response.data.message); // Alert success message
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setLoading(false); // Set loading to false once the request is complete
    }
  };

  // Open the profile modal
  const handleViewProfile = (applicant) => {
    setSelectedApplicant(applicant);
    setOpenModal(true);
  };

  // Close the profile modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedApplicant(null);
  };

  return (
    <div className="admin-container">
      <AdminNavbar />
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h4 className="headn" style={{ fontSize: '1rem', color: '#2c3e50' }}>NEW APPLICANTS</h4>
        </div>

        {/* Display error if any */}
        {error && <div className="error-message" style={{ color: 'red' }}>{error}</div>}

        {/* Loading spinner overlay */}
        {loading && (
          <div style={{
            position: 'fixed', // Fix the position of the spinner on the screen
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.3)', // Slight dark overlay to show loading
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999, // Ensure spinner is on top
          }}>
            <CircularProgress size={50} />
          </div>
        )}

        {/* Applicants Table */}
        <table className='workout-table' style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Profile</th>
              <th>Skills</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((applicant) => (
              <tr key={applicant._id} style={{ borderBottom: '1px solid #ddd' }}>
                <td>{applicant.name}</td>
                <td>
                  {applicant.profilephoto && <img style={{ height: '80px', objectFit: 'cover' }} src={`${process.env.REACT_APP_BACKEND_ROUTE}/${applicant.profilephoto}`} alt="trainer" />}
                </td>
                <td>
                  {Array.isArray(applicant.skills)
                    ? applicant.skills.map((skill, index) => (
                        <div key={index}>{skill}</div>
                      ))
                    : applicant.skills.split(',').map((skill, index) => (
                        <div key={index}>{skill.trim()}</div>
                      ))}
                </td>
                <td>
                  <Button 
                    onClick={() => handleStatusChange(applicant._id, 'accepted')}
                  >
                    <CheckCircleIcon style={{ marginRight: '5px', color: 'green' }} />
                  </Button>
                  <Button 
                    onClick={() => handleStatusChange(applicant._id, 'rejected')}
                  >
                    <CancelIcon style={{ marginRight: '5px', color: 'red' }} />
                  </Button>
                  <Button 
                    onClick={() => handleViewProfile(applicant)}
                    style={{ marginLeft: '10px' }}
                    className='edit'
                  >
                    View Profile
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal to show applicant's detailed profile */}
        <Dialog open={openModal} onClose={handleCloseModal}>
          <DialogTitle style={{ padding: '24px 100px', fontSize: 'medium', letterSpacing: '2px' }}>PROFILE</DialogTitle>
          <DialogContent>
            {selectedApplicant && (
              <div style={{ fontSize: 'small', padding: '18px 24px' }}>
                <div className='mb-2'><strong>Name:</strong> {selectedApplicant.name}</div>
                <div className='mb-2'><strong>Email:</strong> {selectedApplicant.email}</div>
                <div className='mb-2'><strong>Phone:</strong> {selectedApplicant.phonenumber}</div>
                <div className='mb-2'><strong>Skills:</strong> {selectedApplicant.skills.join(', ')}</div>
                <div className='mb-2'><strong>Experience:</strong> {selectedApplicant.experience}</div>
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} style={{ cursor: 'pointer' }} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      <ToastContainer />
    </div>
  );
}

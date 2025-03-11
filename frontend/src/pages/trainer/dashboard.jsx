import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TrainerNavbar } from './navbar-trainer';
import '../../assets/styles/premium-member.css';
import { CheckCircle, Cancel } from '@mui/icons-material'; // Import the icons

export default function Dashboard() {
  const { isAuthenticated, name, trainerId } = useSelector((state) => state.trainer);
  const [pendingClients, setPendingClients] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  


  useEffect(() => {
    const fetchingClients = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/trainer/${trainerId}/pending-clients`);
        setPendingClients(response.data.pendingClients || []);
      } catch (error) {
        console.log(error);
      }
    };

    if (trainerId) {
      fetchingClients();
    }
  }, [trainerId]);

  const handleDecision = async (userId, decision) => {
    try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/trainer/accept-rejectclient`, {
            userId,
            trainerId,
            decision,
        });
        Swal.fire({
          icon: 'success',
          title: decision === 'accept' ? 'Client Accepted!' : 'Client Rejected!',
          text: decision === 'accept' 
              ? 'You have successfully accepted the client!'
              : 'You have successfully rejected the client.',
          confirmButtonText: 'OK',
      });

        // Update pending clients after action
        const updatedResponse = await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/trainer/${trainerId}/pending-clients`);
        setPendingClients(updatedResponse.data.pendingClients || []);
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'Something went wrong!',
        });
    }
};

const handleReject = (clientId) => {
    Swal.fire({
        title: 'Are you sure?',
        text: 'Do you really want to reject this client?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, reject!',
        cancelButtonText: 'No, cancel',
    }).then((result) => {
        if (result.isConfirmed) {
            handleDecision(clientId, 'reject');
        }
    });
};


  return (
    <div>
      <TrainerNavbar />
      <ToastContainer/>
      <div className='m-5 small'>
        <h4 className=" p-1 mb-3" style={{ letterSpacing: '4px', textTransform: 'uppercase' }}>
          HELLO {name}
        </h4>
        <p className="mb-5" style={{ width: '50%', color: '#000000b8' }}>
          We are thrilled to have you here. As a valued member of our Wellness Time community,
          your dedication to guiding and motivating clients is what makes our mission successful.
        </p>
        <div className="form-sections d-flex justify-content-between">
          {/* Workouts preferences */}
          {pendingClients.length > 0 ? (
          <div className="workout-preferences" style={{fontSize:'small',marginLeft:'inherit'}}>
            <h6 className='mb-3'>YOU ARE ASSIGNED TO A  NEW CLIENT!!</h6>
            <div>
             
                <div>
                  {pendingClients.map((client) => (
                    <div key={client._id}>
                      <div style={{fontWeight:'400',color:'#000000b8;'}}>
                        <p>Name: {client.firstname} {client.lastname}</p>
                       
                        <p>Goals: {client.goals.join(' , ')}</p>
                        <p>Foodpreference:{client.diet}</p>
                        <p>Sleepschedule:{client.sleepSchedule}</p>
                      
                        <p>Would you like to accept this client and start working with them?</p>
                        <button
                          variant="contained"
                          style={{background:'transparent',color:'black',border:'none',marginRight:'11px'}}
                          onClick={() => handleDecision(client._id, 'accept')}
                          
                        >
                          <CheckCircle style={{ fontSize: 20 }} /> 
                        </button>
                        <button
                          variant="contained"
                          style={{background:'transparent',color:'black',border:'none'}}
                          onClick={() => handleReject(client._id, 'reject')}
                        >
                          <Cancel style={{ fontSize: 20 }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                </div>
                </div>
              ) : (
                <p></p>
              )}
            </div>
         
      </div>
    </div>
  );
}

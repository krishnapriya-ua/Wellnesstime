import '../../assets/styles/chooseworkout.css';
import { Navbar } from './navbar';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LoginModal } from './loginpopup';

export default function ChooseWorkout() {
  const [workouts, setWorkouts] = useState([]);
  const { isAuthenticated } = useSelector((state) => state.user);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate(); // Use navigate for redirection

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/workouts`);
      setWorkouts(response.data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  const handleWorkoutClick = (workout) => {
    if (isAuthenticated) {
      navigate(`/timer/${workout._id}`, { state: {workout} }); // Redirect if authenticated
    } else {
      setShowLoginModal(true); // Show login modal if not authenticated
    }
  };

  return (
    <div className="workout">
      <Navbar />
      <div className="container mt-5">
        <div className="text-center mb-4">
          <h5 className="headn text-center mb-3" style={{ letterSpacing: '4px' }}>
            PICK A ONE
          </h5>
          <p
            className="text-center p-1 mb-5"
            style={{ width: '70%', margin: '0 auto', color: '#000000b8' }}
          >
            Research indicates that daily movement significantly enhances overall health and
            productivity. Choose a workout today and invest in your well-being.
          </p>
        </div>

        <div className="row g-5 justify-content-center">
          {workouts.map((workout, index) => {
            const image = workout.photos && workout.photos.length > 1 ? workout.photos[1] : workout.photos[0];

            return (
              <div className="col-6 col-sm-6 col-md-4 col-lg-3" key={index}>
                <Box className="box text-center" onClick={() => handleWorkoutClick(workout)}>
                  <img
                    key={index}
                    src={`${process.env.REACT_APP_BACKEND_ROUTE}/${image}`}
                    alt={workout.name}
                    className="img-fluid rounded"
                  />
                  <p className="workout-title">{workout.name}</p>
                  <div className="d-flex justify-content-center gap-5 mt-2">
                    <i className="bi bi-info-circle"></i>
                    <i className="bi bi-heart"></i>
                  </div>
                </Box>
              </div>
            );
          })}
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
  <LoginModal
    isOpen={showLoginModal}
    onClose={() => setShowLoginModal(false)} // Close modal when the user clicks outside or on the close button
  />
)}

    </div>
  );
}

import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import { TextField, Button } from '@mui/material';

export default function Feedback() {
  const [feedbackText, setFeedbackText] = useState('');
  const { userId } = useSelector((state) => state.user); // Adjusted destructuring

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!feedbackText.trim()) {
      toast.error('Feedback cannot be empty!');
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/userroute/feedback`, {
        userId,
        feedbackText,
      });

      toast.success('Thank you for your feedback!');
      setFeedbackText('');
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="container">
      <ToastContainer />
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            placeholder="Enter your feedback"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            multiline
            rows={4}
            variant="outlined"
            style={{ marginBottom: '1rem' }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
          >
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
}

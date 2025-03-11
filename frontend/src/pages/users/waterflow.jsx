import React from 'react';
import { CircularProgress } from '@mui/material';

const CircularProgressBar = ({ progress }) => {
  const getColor = (percentage) => {
    if (percentage <= 30) {
      return '#FF6347'; // Red
    } else if (percentage <= 70) {
      return '#FFA500'; // Orange
    } else {
      return '#32CD32'; // Green
    }
  };

  return (
    <div style={{  }}>
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <CircularProgress
          variant="determinate"
          value={progress}
          sx={{
            color: getColor(progress),
            transform: 'rotate(-90deg)', // Start progress from the top
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round', // Rounded stroke end
              transition: 'stroke 0.5s ease', // Smooth transition for color change
            },
          }}
          size={40}
          thickness={4}
        />
        <div
          style={{
            position: 'absolute',
            top: '23%',
            left: '25%',
            transform: 'translate(-50%, -50%)',
            fontSize: 12,
            fontWeight: 'bold',
            color: getColor(progress),
          }}
        >
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
};

export default CircularProgressBar;

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import axios from 'axios';
import { useSelector } from 'react-redux';

const WorkoutBarChart = () => {
  const userId = useSelector((state) => state.user.userId);
  const [data, setData] = useState([]);
  const [workoutTypes, setWorkoutTypes] = useState([]);

  const fetchWorkoutData = async () => {
    try {
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Past Monday
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(today); // Today's date
      endDate.setHours(23, 59, 59, 999);

      const response = await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/userroute/getworkoutdata`, {
        params: { userId, startDate, endDate },
      });

      const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const workoutData = daysOfWeek.map((day) => ({
        name: day,
      }));

      const types = new Set();

      response.data.forEach((workout) => {
        const workoutDate = new Date(workout.date);
        const day = workoutDate.toLocaleDateString('en-US', { weekday: 'short' });

        if (workoutDate >= startDate && workoutDate <= endDate) {
          const dayData = workoutData.find((d) => d.name === day);
          types.add(workout.workoutName);

          if (!dayData[workout.workoutName]) {
            dayData[workout.workoutName] = 0;
          }
          dayData[workout.workoutName] += workout.duration;
        }
      });

      setData(workoutData);
      setWorkoutTypes(Array.from(types));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchWorkoutData();
  }, [userId]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
          <p>{payload[0].payload.name}</p>
          {payload.map((entry) => (
            <p key={entry.name} style={{ color: entry.color }}>
              {`${entry.name}: ${Math.round(entry.value / 60)} minutes`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const colorPalette = [
    "#8884d8", // Purple
    "#82ca9d", // Green
    "#ffc658", // Yellow
    "#ff8042", // Orange
    "#a4de6c", // Light Green
    "#d0ed57", // Lime
    "#8dd1e1", // Light Blue
  ];

  return (
    <BarChart width={500} height={300} data={data}>
      <XAxis dataKey="name" stroke="#8884d8" />
      <YAxis tickFormatter={(value) => `${Math.round(value / 60)} min`} />
      <Tooltip content={<CustomTooltip />} />
      <Legend />
      <CartesianGrid strokeDasharray="5 5" />
      {workoutTypes.map((type, index) => (
        <Bar key={type} dataKey={type} stackId="a" fill={colorPalette[index % colorPalette.length]} />
      ))}
    </BarChart>
  );
};

export default WorkoutBarChart;

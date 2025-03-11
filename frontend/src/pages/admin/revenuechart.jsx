import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../../assets/styles/revchart.css'
const RevenueChart = ({ data, timeRange }) => {

  const formatXAxis = (date) => {
    if (timeRange === 'weekly') {
      return new Date(date).toLocaleDateString('en-US', { weekday: 'short' }); // Day of the week (Mon, Tue, etc.)
    } else if (timeRange === 'monthly') {
      const [year, month] = date.split('-'); // Extract year and month (e.g., '2024-01')
      return `${new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short' })} ${year}`; // Jan 2024
    } else if (timeRange === 'yearly') {
      return date; // Directly show year (e.g., 2024)
    }
    return date;
  };
  

  return (
    <ResponsiveContainer width="90%" height={295} style={{marginLeft:'0rem',margin:'1rem'}}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={formatXAxis} />
        <YAxis />
        <Tooltip formatter={(value) => `₹${value}`} labelFormatter={(date) => `Date: ${date}`} />
        <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;

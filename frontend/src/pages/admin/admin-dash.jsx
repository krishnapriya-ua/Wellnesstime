import React, { useEffect, useState } from 'react';
import { AdminNavbar } from './admin-nav';
import '../../assets/styles/admindash.css';
import user from '../../assets/images/usericon.png';
import revenue from '../../assets/images/revicon.png';
import trainer from '../../assets/images/traicon.png';
import premium from '../../assets/images/preicon.png';
import RevenueChart from './revenuechart';
import axios from 'axios'
import { Button,TextField ,Dialog,DialogActions,DialogContent,DialogTitle} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Admindashboard() {
  const [stats, setStats] = useState({
    totalusers: 0,
    premiumusers: 0,
    totaltrainers: 0,
    totalRevenue: 0
  });
  const navigate=useNavigate()

  const [revenueHistory, setRevenueHistory] = useState([]);
  const [timeRange, setTimeRange] = useState('weekly');
  const [topTrainers,setTopTrainers] = useState([])
  const [topWorkouts,setTopWorkouts] = useState([])
  const [open,setOpen] = useState(false)
  const [startDate,setStartDate] = useState('')
  const [endDate,setEndDate] = useState('')

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)




  useEffect(() => {
    const fetchrevenuehistory = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/revenue-history`);
        setRevenueHistory(response.data.revenueHistory);
      } catch (error) {
        console.log(error);
      }
    };
    fetchrevenuehistory();
  }, []);

  const handletimeRangechange = (range) => {
    setTimeRange(range);
  };

  const getweekNumber = (date) => {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayofYear = Math.floor(diff / oneDay);
    return Math.ceil(dayofYear / 7);
  };

  const getTransformedData = () => {
    const currentDate = new Date();
    let transformedData = [];
  
    switch (timeRange) {
      case 'weekly':
        const startOfWeek = new Date(currentDate);
        const endOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Set start of the week
        startOfWeek.setHours(0, 0, 0, 0);
        endOfWeek.setDate(currentDate.getDate() + (6 - currentDate.getDay())); // Set end of the week
        endOfWeek.setHours(23, 59, 59, 999);
  
        // Create an array for each day in the week
        for (let i = 0; i < 7; i++) {
          const day = new Date(startOfWeek);
          day.setDate(startOfWeek.getDate() + i);
          const dayData = revenueHistory.filter(
            (item) => new Date(item.date).toDateString() === day.toDateString()
          );
      
          const totalRevenueForDay = dayData.reduce((total, item) => total + (item.revenue || 0), 0);
      
          transformedData.push({
            date: day.toDateString(),
            revenue:totalRevenueForDay,
          });
        }
        break;
  
      case 'monthly':
        for (let i = 0; i < 12; i++) {
          const monthStart = new Date(currentDate.getFullYear(), i, 1);
          const monthEnd = new Date(currentDate.getFullYear(), i + 1, 0);
          const monthData = revenueHistory.filter(
            (item) =>
              new Date(item.date).getMonth() === i &&
              new Date(item.date).getFullYear() === currentDate.getFullYear()
          );
  
          const totalRevenueForMonth = monthData.reduce((total, item) => total + item.revenue, 0);
  
          // Format date as YYYY-MM
          transformedData.push({
            date: `${currentDate.getFullYear()}-${(i + 1).toString().padStart(2, '0')}`,
            revenue: totalRevenueForMonth || 0,
          });
        }
        break;
  
      case 'yearly':
        const years = [2023, 2024, 2025, 2026];
        years.forEach((year) => {
          const yearData = revenueHistory.filter(
            (item) => new Date(item.date).getFullYear() === year
          );
  
          const totalRevenueForYear = yearData.reduce((total, item) => total + item.revenue, 0);
  
          transformedData.push({
            date: year.toString(),
            revenue: totalRevenueForYear || 0,
          });
        });
        break;
  
      default:
        break;
    }
  
    return transformedData;
  };
  

  useEffect(() => {
    const fetchdetails = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/details`);
        setStats({
          totalusers: response.data.totalusers,
          premiumusers: response.data.premiumusers,
          totaltrainers: response.data.totaltrainers,
          totalRevenue: response.data.totalRevenue
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchdetails();
  }, []);



  useEffect(()=>{
    const fetchTopTrainers=async()=>{
      try {
       const response=await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/get-top-trainers`)
       setTopTrainers(response.data)
      
      } catch (error) {
       console.error('Error fetching top trainers:', error);
      }
   }
   fetchTopTrainers()
  },[])

  useEffect(()=>{
    const fetchTopWorkout=async()=>{
      try {
        const response=await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/get-top-workouts`)
        setTopWorkouts(response.data)
        console.log(response.data)
      } catch (error) {
        console.log(error)
      }
    }
    fetchTopWorkout()
  },[])


  const handleSubmit=async()=>{
    try {
      const response=await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/revenue-report`,{
        startDate,
        endDate
      })
      console.log('REPORT DATA',response.data)
      handleClose() 
      navigate('/admin/revenue-report',{state:{reportData: response.data}})
      
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  }
 
  return (
    <div className="admin-container">
      <AdminNavbar />
      <div className="main-content">
        <h6 style={{ letterSpacing: '1px' }} className='mb-5'>DASHBOARD</h6>

        {/* Header Stats */}
        <div className="header-row">
          <div className="header-column">
            <img className="icon" src={user} alt="User Icon" />
            <div className="calculation">
              <p>Total Users</p>
              <h6>{stats.totalusers}</h6>
            </div>
          </div>
        
          <div className="header-column">
            <img className="icon" src={premium} alt="Premium Icon" />
            <div className="calculation">
              <p>Premium Users</p>
              <h6>{stats.premiumusers}</h6>
            </div>
          </div>
          <div className="header-column">
            <img className="icon" src={trainer} alt="Trainer Icon" />
            <div className="calculation">
              <p>Total Trainers</p>
              <h6>{stats.totaltrainers}</h6>
            </div>
          </div>
          <div className="header-column">
            <img className="icon" src={revenue} alt="Revenue Icon" />
            <div className="calculation">
              <p>Total Revenue</p>
              <h6>Rs.{stats.totalRevenue}</h6>
            </div>
          </div>
        </div>

      
        <div className="content-row">
          <div className="chart-column">
            <div className="row" style={{justifySelf:'space-around'}}>
            <h6 style={{ letterSpacing: '1px' }}>REVENUE CHART</h6>
            <div className='allbutton' style={{display:'flex',flexDirection:'row',justifyContent:'space-between'}}>
            <div className='mt-2'>
              <Button className='revbutton' style={{marginLeft:'-4px'}} onClick={() => handletimeRangechange('weekly')}>weekly</Button>
              <Button className='revbutton' onClick={() => handletimeRangechange('monthly')}>monthly</Button>
              <Button className='revbutton' onClick={() => handletimeRangechange('yearly')}>yearly</Button>
            </div>
            <div className="revenuereport mt-2">
            <Button className='revbutton' style={{marginRight:'5rem'}} onClick={handleOpen}>get revenue report</Button>

            <Dialog open={open} onClose={handleClose}>
              <DialogTitle style={{fontSize:'small'}} className='my-1'>SELECT DATE</DialogTitle>
              <DialogContent>
                <TextField
                type='date'
                label='START DATE'
                fullWidth
                value={startDate}
                onChange={(e)=>setStartDate(e.target.value)}
                InputLabelProps={{shrink:true}}
                margin='dense'
                />

                <TextField
                type='date'
                label='END DATE'
                fullWidth
                value={endDate}
                onChange={(e)=>setEndDate(e.target.value)}
                InputLabelProps={{shrink:true}}
                margin='dense'
                />

              </DialogContent>

              <DialogActions>
                <Button onClick={handleSubmit} className='revbutton'>submit</Button>
                <Button onClick={handleClose} className='revbutton'>Cancel</Button>
              </DialogActions>
            </Dialog> 

            </div>
            </div>
            </div>
           
           
            <RevenueChart key={timeRange} data={getTransformedData()} timeRange={timeRange} />
          </div>
        </div>


        <div className="content-row mt-5">
  <div className="top-trainer col-md-6">
    <h6>TOP WORKOUTS</h6>
    <table className="table table-sm">
      <thead>
        <tr>
          <th>No:</th>
          <th>Workout Name</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
        {topWorkouts.map((workout, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{workout.workoutDetails.name}</td>
            <td>{Math.floor(workout.totalDuration / 60)} minutes</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  <div className="top-trainer col-md-6">
    <h6>TOP TRAINERS</h6>
    <table className="table table-sm">
      <thead>
        <tr>
          <th>No:</th>
          <th>Trainer Name</th>
          <th>Total Clients</th>
        </tr>
      </thead>
      <tbody>
        {topTrainers.map((trainer, index) => (
          <tr key={trainer.trainerDetails?._id}>
            <td>{index + 1}</td>
            <td>{trainer?.name}</td>
            <td>{trainer?.clientCount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>




      </div>
    </div>
  );
}

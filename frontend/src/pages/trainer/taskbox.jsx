import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
//import Button from '@mui/material/Button';
import { TrainerNavbar } from './navbar-trainer';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { Button,TextField ,Dialog,DialogActions,DialogContent,DialogTitle} from '@mui/material';
import { Link } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { CircularProgress,Typography } from '@mui/material';



export default function TrainerTaskbox() {
    const trainerId = useSelector((state) => state.trainer.trainerId);
    const location = useLocation();
    const { clientId, firstname, lastname } = location.state || {};
    const [showDatePicker, setShowDatePicker] = useState(false); 
    const [taskname, setTaskName] = useState('');
    const [tasks, setTasks] = useState([]);
    const [selectedDate,setSelectedDate]= useState(new Date())
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editedTaskname, setEditedTaskname] = useState('');
    const [editedDate, setEditedDate] = useState(new Date());
      
    
      const [open,setOpen] = useState(false)
      const [startDate,setStartDate] = useState('')
      const [endDate,setEndDate] = useState('')
      const [filteredTasks,setFilteredTasks]=useState([])
      const navigate=useNavigate()
    
      const handleOpen = () => setOpen(true)
      const handleClose = () => setOpen(false)

      const getTodayDate = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        return `${year}-${month}-${day}`;
      };
    
      // Get the start of this week (Monday) and end of this week (Sunday)
      const getThisWeekDateRange = () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const diffToMonday = (dayOfWeek + 6) % 7; // Calculate days to Monday
        const diffToSunday = (dayOfWeek + 1) % 7; // Calculate days to Sunday
    
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - diffToMonday);
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + diffToSunday);
    
        const start = `${startOfWeek.getFullYear()}-${String(startOfWeek.getMonth() + 1).padStart(2, "0")}-${String(startOfWeek.getDate()).padStart(2, "0")}`;
        const end = `${endOfWeek.getFullYear()}-${String(endOfWeek.getMonth() + 1).padStart(2, "0")}-${String(endOfWeek.getDate()).padStart(2, "0")}`;
        
        return { start, end };
      };
    
      const handleFilteredTask = async () => {
        try {
          const response = await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/trainer/filter-task`, {
            trainerId,
            clientId,
            startDate,
            endDate,
          });
          if (response.data.success) {
            setFilteredTasks(response.data);
            console.log(response.data);
            handleClose();
            navigate("/trainer/taskreport", { state: { taskReport: response.data, clientId } });
          }
        } catch (error) {
          console.error("Error fetching filtered tasks:", error);
        }
      };
    
      // Handle today button click
      const handleTodayClick = () => {
        const today = getTodayDate();
        setStartDate(today);
        setEndDate(today);
        handleFilteredTask();
      };
    
      // Handle this week button click
      const handleThisWeekClick = () => {
        const { start, end } = getThisWeekDateRange();
        setStartDate(start);
        setEndDate(end);
        handleFilteredTask();
      };
    

    useEffect(() => {
        if (trainerId && clientId) {
            axios
                .get(`${process.env.REACT_APP_BACKEND_ROUTE}/trainer/tasks/${trainerId}/${clientId}`)
                .then((response) => setTasks(response.data.tasks || []))
                .catch((error) => console.log('Error fetching tasks:', error));
        }
    }, [clientId, trainerId]);

    const handleTaskNameChange = (e) => {
        setTaskName(e.target.value);
    };

    const handlekeypress=(e)=>{
        if(e.key==='Enter'){
            handleAssignTask(e)
        }
    }

    const handleAssignTask = (e) => {
        e.preventDefault();
        if (!taskname.trim()) {
            toast.info('Please enter a task name.');
            return;
        }

        const newTask = {
            trainerId,
            clientId,
            taskname,
            date:selectedDate
        };

        axios
            .post(`${process.env.REACT_APP_BACKEND_ROUTE}/trainer/tasks/assign`, newTask)
            .then((response) => {
                setTasks([...tasks, response.data.task]);
                setTaskName('');
               
                toast.success('Task assigned successfully.');
            })
            .catch((error) => {
                toast.error('Failed to assign task.');
                console.log(error);
            });
    };

    

  const calculateCompletion = (tasks) => {
    if (!Array.isArray(tasks)) {
        console.error('Tasks is not an array:', tasks);
        return '0/0 completed';
    }
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;

    const completionPercentage = (completedTasks / totalTasks) * 100;

    return (
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center',marginRight:'8rem' }}>
            <CircularProgress 
                size={35} 
                value={completionPercentage} 
                variant="determinate" 
                color="black" 
                style={{ position: 'absolute' }}  // Keeps the progress circle in place
            />
            <Typography 
                variant="caption" 
                component="div" 
                style={{
                    position: 'absolute', 
                    fontSize: '9px', 
                    fontWeight: '500',
                    color: 'black', // Ensure text is visible against different backgrounds
                }}
            >
                {Math.round(completionPercentage)}%
            </Typography>
            <p style={{ fontSize: 'x-small', textAlign: 'center', marginTop: '25px',marginLeft:'7rem' }}>
                {completedTasks}/{totalTasks} Completed
            </p>
        </div>
    );
};

  
    const groupedTasks= tasks.reduce((acc,task)=>{
        const date=new Date(task.date).toDateString()
        acc[date]=acc[date]||[]
        acc[date].push(task)
        return acc
    },{})

    const sortedGroupedTasks = Object.keys(groupedTasks)
    .sort((a, b) => new Date(a) - new Date(b))
    .reduce((acc, key) => {
        acc[key] = groupedTasks[key];
        return acc;
    }, {});


    const displayDate = (date) => {
        const today = new Date();
        const taskDate = new Date(date);
    
        // Check if the task date is today
        if (
            taskDate.getDate() === today.getDate() &&
            taskDate.getMonth() === today.getMonth() &&
            taskDate.getFullYear() === today.getFullYear()
        ) {
            return "Today";
        }
    
        // Display tasks within the week as weekday names
        const dayDifference = (taskDate - today) / (1000 * 60 * 60 * 24);
        if (dayDifference >= 0 && dayDifference < 7) {
            return taskDate.toLocaleDateString("en-IN", { weekday: "long" });
        }
    
        // Display full date for other cases
        return taskDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };



const handleEditClick = (task) => {
    setEditingTaskId(task._id);
    setEditedTaskname(task.taskname);
    setEditedDate(new Date(task.date));
};

const handleEditSave = () => {
    axios
        .put(`${process.env.REACT_APP_BACKEND_ROUTE}/trainer/tasks/edit`, {
            trainerId,
            clientId,
            taskId: editingTaskId,
            updatedTaskname: editedTaskname,
            updatedDate: editedDate,
        })
        .then((response) => {
            const updatedTask = response.data.task;
            setTasks(tasks.map(task => task._id === updatedTask._id ? updatedTask : task));
            setEditingTaskId(null);
            toast.success('Task updated successfully.');
        })
        .catch((error) => {
            console.error('Error updating task:', error);
            toast.error('Failed to update task.');
        });
};

const handleDeleteClick = (taskId) => {
    toast.info(
      <div>
        <p>Are you sure you want to delete this task?</p>
        <Button
          className="delete"
          onClick={async () => {
            try {
              await axios.delete(`${process.env.REACT_APP_BACKEND_ROUTE}/trainer/tasks/delete`, {
                data: { trainerId, clientId, taskId: taskId }
              });
              setTasks(tasks.filter((task) => task._id !== taskId));
              toast.dismiss();
              toast.success('Task deleted successfully!');
            } catch (error) {
              toast.error('Failed to delete task');
            }
          }}
          style={{fontSize:'x-small',background:'#802727',color:'white'}}
        >
          Confirm
        </Button>
        <Button style={{ marginLeft: '5px',fontSize:'x-small',background:'#03032bc2',color:'white' }} className="edit" onClick={() => toast.dismiss()}>
          Cancel
        </Button>
      </div>,
      { autoClose: false }
    );
};




return (
    <div>
      <TrainerNavbar />
      <ToastContainer />
      <div className="container my-5">
        <div
          className=""
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
          <Link style={{ color: '#000000ab', fontSize: 'small' }} to="/trainer/clients">
            <p style={{ fontWeight: '600', marginTop: '-1rem', marginBottom: '2rem' }}>BACK</p>
          </Link>
          <p
            className="mb-0"
            style={{
              letterSpacing: '2px',
              fontSize: 'x-small',
              textTransform: 'uppercase',
              cursor: 'pointer',
              marginTop:'2rem',
             
            }}
            onClick={handleOpen}
          >
            see {firstname} {lastname} 's <br />  <Button style={{background:'black',color:'white',fontSize:'xx-small',marginTop:'11px'}}> progress sheet</Button>
          </p>

                      <Dialog open={open} onClose={handleClose}>
                        <DialogTitle style={{fontSize:'small'}} className='my-1'>SELECT DATE</DialogTitle>
                        <div style={{display:'flex',flexDirection:'row',position:'relative',gap:'2rem',marginLeft:'26px'}}>
                        <Button
                        onClick={handleTodayClick}
                        style={{ background: "black", color: "white", fontSize: "x-small" }}
                         >
                         Today
                       </Button>
                       <Button
                       onClick={handleThisWeekClick}
                        style={{ background: "black", color: "white", fontSize: "x-small" }}
                       >
                       This Week
                       </Button>
                       </div>
                       <p style={{fontSize:'small',paddingTop:'2rem',marginBottom:'-5px',marginLeft:'25px',fontWeight:'400'}}>CHOOSE DATE</p>
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
                          <Button onClick={handleFilteredTask} style={{background:'black',color:'white',fontSize:'x-small'}}>submit</Button>
                          <Button onClick={handleClose} style={{background:'black',color:'white',fontSize:'x-small'}}>Cancel</Button>
                        </DialogActions>
                      </Dialog> 
          
        </div>
  
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8 col-sm-12">
            <form onSubmit={handleAssignTask} className="mb-4">
            <div className="mb-3">
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      cursor: 'pointer',
                      marginLeft: '0rem',
                      marginTop: '1rem',
                    }}
                  >
                   
                      <div style={{ fontSize: 'small', border: 'none' }}>
                       <span style={{fontSize:'large'}}>📅</span> 
                        <DatePicker
                          selected={selectedDate}
                          onChange={(date) => setSelectedDate(date)}
                          style={{ fontSize: '10' }}
                          dateFormat="dd-MM-yyyy"
                        />
                      </div>
                  
                  </div>
                </div>
              <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                <div className="mb-3" style={{width:'77%'}}>
                  <input
                    type="text"
                    value={taskname}
                    onChange={handleTaskNameChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (taskname.trim()) {
                          handleAssignTask(e);
                        } else {
                          toast.info('Please enter a task name');
                        }
                      }
                    }}
                    name="task"
                    id="taskname"
                    className="form-control"
                    placeholder="Enter task here"
                    style={{
                      border: 'none',
                      borderRadius: '0px',
                      width: '100%',
                      marginRight: '0rem',
                      height: '3rem',
                      background: '#dcdcdc63',
                      transition: 'none',
                    }}
                  />
                </div>
                <div className="button m-2">
                  <Button style={{background:'black',color:'white',fontSize:'x-small'}} onClick={handleAssignTask}>Submit</Button>
                </div>
  
                
              </div>
            </form>
  
            {Object.keys(sortedGroupedTasks).map((date) => (
               
              <div key={date}>
                 <div className='mt-4 mb-2' style={{display:'flex',flexDirection:'row',justifyContent:'space-between'}}>
                <h6 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: 'small' }} className="mt-3">
                  {displayDate(date)}
                </h6>
                <div >
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div 
                        style={{
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        {calculateCompletion(sortedGroupedTasks[date])}
                    </div>
                   
                </div>

                </div>
                </div>
                <ul className="list-group">
                  {sortedGroupedTasks[date].map((task) => (
                    <li
                      key={task._id}
                      className={`list-group-item d-flex justify-content-between align-items-center ${
                        task.completed ? 'list-group-item-success' : ''
                      }`}
                    >
                      {editingTaskId === task._id ? (
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                          <input
                            type="text"
                            value={editedTaskname}
                            onChange={(e) => setEditedTaskname(e.target.value)}
                            className="form-control"
                            style={{ width: '150%', fontSize: 'small', letterSpacing: '1px' }}
                          />
                          <Button
                            className="btn btn-success btn-sm"
                            style={{ background: 'black', fontSize: 'x-small', color: 'white' }}
                            onClick={handleEditSave}
                          >
                            Save
                          </Button>
                          <Button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setEditingTaskId(null)}
                            style={{ background: 'black', fontSize: 'x-small', color: 'white' }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                            alignItems: 'center',
                          }}
                        >
                          <span
                            style={{
                              letterSpacing: '2px',
                              fontSize: 'x-small',
                              textTransform: 'uppercase',
                            }}
                          >
                            {task.taskname}
                          </span>
                          <div>
                            <Button
                              onClick={() => handleEditClick(task)}
                              style={{ padding: '0', margin: '0' }}
                            >
                              <EditIcon style={{ fontSize: '16px' }} />
                            </Button>
                            <Button
                              onClick={() => handleDeleteClick(task._id)} // Delete button
                              style={{ padding: '0', margin: '0' }}
                            >
                              <DeleteIcon style={{ fontSize: '16px' }} />
                            </Button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  
}

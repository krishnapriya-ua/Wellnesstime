import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { Navbar } from './navbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

export default function Clienttasks() {
    const userId = useSelector((state) => state.user.userId);
    const [trainer, setTrainer] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [checkedtasks, setCheckedTasks] = useState({});
    const [progress, setProgress] = useState(0); // State for progress percentage

    useEffect(() => {
        const fetchTrainer = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/userroute/gettrainer/${userId}`);
                setTrainer(response.data);
            } catch (error) {
                console.error('Error fetching trainer:', error);
            }
        };
        if (userId) fetchTrainer();
    }, [userId]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_ROUTE}/trainer/gettasks/${trainer?._id}/${userId}`
                );
                const fetchedTasks = response.data.tasks || [];
                setTasks(fetchedTasks);

                const initialCheckedState = fetchedTasks.reduce((acc, task) => {
                    acc[task._id] = task.completed;
                    return acc;
                }, {});
                setCheckedTasks(initialCheckedState);
                calculateProgress(fetchedTasks); // Update progress when tasks are fetched
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };
        if (trainer?._id && userId) fetchTasks();
    }, [trainer, userId]);

    const isToday = (taskDate) => {
        const today = new Date();
        const task = new Date(taskDate);

        return (
            today.getDate() === task.getDate() &&
            today.getMonth() === task.getMonth() &&
            today.getFullYear() === task.getFullYear()
        );
    };

    const filteredTasks = tasks.filter((task) => isToday(task.date));

    const calculateProgress = (tasksList) => {
        const totalTasks = tasksList.length;
        const completedTasks = tasksList.filter((task) => task.completed).length;
        const percentage = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
        setProgress(percentage);
    };

    useEffect(() => {
        calculateProgress(filteredTasks);
    }, [filteredTasks]);

    const calculatemessage = () => {
        const totaltasks = filteredTasks.length;
        const completedtasks = filteredTasks.filter((task) => task.completed).length;
        if (totaltasks === 0) {
            return '';
        }
        if (completedtasks === 0) {
            return "No tasks completed yet! Keep pushing forward, you've got this! 💪";
        }
        if (completedtasks === totaltasks) {
            return "All tasks completed! Fantastic work today! 🎉";
        }

        return `${completedtasks}/${totaltasks} tasks completed. You're making progress! Keep going! 🚀`;
    };

    const handleTaskToggle = (taskId) => {
        setCheckedTasks((prev) => ({
            ...prev,
            [taskId]: !prev[taskId],
        }));
    };

    const handleTaskSubmission = async () => {
        const isAnyTaskSelected = Object.values(checkedtasks).some((isChecked, index) => {
            // Check if the task is checked and if its name is not just empty spaces
            return isChecked && (tasks[index].taskname.trim() !== '');
        });
        if (!isAnyTaskSelected) {
            toast.info('No task selected. Please select at least one task before submitting.');
            return;
        }
    
        try {
            const updatedTasks = tasks.map((task) => ({
                ...task,
                completed: checkedtasks[task._id] || false,
            }));
    
            const response = await axios.put(`${process.env.REACT_APP_BACKEND_ROUTE}/trainer/updatetasks`, {
                trainerId: trainer._id,
                clientId: userId,
                tasks: updatedTasks,
            });
    
            if (response.data.success) {
                setTasks((prevTasks) =>
                    prevTasks.map((task) => ({
                        ...task,
                        completed: updatedTasks.find((t) => t._id === task._id)?.completed || task.completed,
                    }))
                );
                calculateProgress(updatedTasks);
                toast.success('Tasks updated successfully.');
            } else {
                toast.error(response?.data?.message);
            }
        } catch (error) {
            console.error('Error updating tasks:', error);
            toast.info(error.response?.data?.message||'Failed to update tasks.');
        }
    };
    

    return (
        <div style={{ width: '98%', scrollbarWidth: 'hidden', height: '169vh' }}>
            <Navbar />
            <ToastContainer />
            <div className="row justify-content-center my-5 m-2">

                <Link  style={{ color: "#000000ab", fontSize: "small",paddingTop:'2rem' }} className='preback' to="/premium-userprofile">
                    <p className='m-3 ' style={{ fontWeight: '600' }}>BACK</p>
                </Link>

                <div className="col-lg-6 col-md-8 col-sm-12">
                    <h6 className="mb-4" style={{ letterSpacing: '2px' }}>
                        TODAY'S TASKS
                    </h6>
                    <Box display="flex" alignItems="center" gap={6} mb={1}>
    <p style={{ fontSize: 'small', letterSpacing: '1px' }}>{calculatemessage()}</p>
    <div style={{paddingTop:'1rem'}}>
    <Box position="relative" display="inline-flex" >
        <CircularProgress variant="determinate" value={progress} size={40} color='black' />
        <Box
            position="absolute"
            top="50%"
            left="50%"
            style={{ transform: 'translate(-50%, -50%)' }}
            display="flex"
            alignItems="center"
            justifyContent="center"
        >
            <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{progress}%</span>
           
        </Box>
       
    </Box>
    <p style={{ fontSize: 'x-small', letterSpacing: '1px' }}>completed</p>
    </div>
</Box>

                    {filteredTasks.length > 0 ? (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleTaskSubmission();
                            }}
                        >
                            <ul className="list-group mb-3">
                                {filteredTasks.map((task) => (
                                    <li
                                        key={task._id}
                                        className="list-group-item d-flex align-items-center"
                                        style={{
                                            marginBottom: '11px',
                                            marginTop: '11px',
                                            textAlign: 'center',
                                            padding: '10px',
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            className="form-check-input me-3"
                                            checked={checkedtasks[task._id] || false}
                                            onChange={() => handleTaskToggle(task._id)}
                                            disabled={task.completed}
                                            style={{border:'1px solid black'}}
                                        />
                                        <span
                                            style={{
                                                letterSpacing: '2px',
                                                textTransform: 'uppercase',
                                                fontSize: 'small',
                                            }}
                                        >
                                            {task.taskname}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <div>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    className="mb-4"
                                    style={{ background: 'black', fontSize: 'small' }}
                                >
                                    Submit Tasks
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <p className="text-muted">No tasks assigned for today.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import '../../assets/styles/workout.css'
import { TrainerNavbar } from './navbar-trainer'
import { Button,CircularProgress,Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
export default function Clients() {
    const trainerId=useSelector((state)=>state.trainer.trainerId)
    const [clients,setClients]=useState([])
    const [taskscompletion,setTasksCompletion]=useState({})


    const navigate=useNavigate()


    const handlechatbox=()=>{
     navigate('/trainer/chatbox') 
    }
    const handletaskbox=(clientId)=>{
      navigate('/trainer/taskbox',{state:{clientId}}) 
     }

    useEffect(()=>{
       const fetchclients=async()=>{
        try {
            const response=await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/trainer/getclients`,{
                params:{trainerId},
        })
        setClients(response.data)
        } catch (error) {
            console.log('Error fetching clients:', error);
        }
       
       }
       fetchclients()
    },[trainerId])

    const fetchTaskcompletion=async(clientId)=>{
      try {
        const response=await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/trainer/getclienttasks`,{
          params:{trainerId,clientId}
        })
        
        const{completionPercentage}=response.data

        setTasksCompletion(prevState=>({
          ...prevState,
          [clientId]:completionPercentage
        }))
      } catch (error) {
        console.error('Error fetching task completion:', error);
      }

    }

    useEffect(()=>{
      clients.forEach(client=>{
        fetchTaskcompletion(client._id)
      })
    },[clients])
    return (
        <div>
            <TrainerNavbar/>
          
          {clients.length > 0 ? (
            <table className="workout-table my-5" style={{width:'80%',justifySelf:'center',fontSize:'x-small',textAlign:'left'}}>
            <thead>
                <tr>
                  <th>Name</th>
                  <th>Goals</th>
                  <th>Progress</th>
                  <th>Actions</th>
                  
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client._id}>
                    <td className='m-1' style={{textAlign:"left",textTransform:'uppercase',letterSpacing:'1px'}}>{client.firstname} {client.lastname}</td>
                    <td style={{textAlign:'left',fontSize:'12px'}}>{client.goals.join(' , ')}</td>
                    <td>
                    {taskscompletion[client._id]!==undefined && (
                      <div style={{position:'relative',display:'flex',justifyContent:'center',alignItems:'center'}}>
                        <CircularProgress 
                        size={36}
                        value={taskscompletion[client._id]}
                        variant='determinate'
                        color='black'
                        />

                        <Typography
                        variant='caption'
                        component='div'
                        style={{
                          position:'absolute',
                          fontSize:'11px',
                          fontWeight:'bold',
                          color:'black'

                        }}
                        
                        >
                          {Math.round(taskscompletion[client._id])}%
                        </Typography>
                      </div>
                    )}
                    </td>



                    <td>
                      <div >
                      <Button onClick={()=>navigate('/trainer/chatbox',{state:{client:client}})} style={{margin:'1rem',font:'small-caption'}} className='edit'>Chatbox</Button>
                      <Button style={{font:'small-caption'}} onClick={()=>navigate('/trainer/taskbox',{state:{
                        clientId:client._id,firstname:client.firstname,lastname:client.lastname
                      }})} className='edit' >Taskbox</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No clients assigned.</p>
          )}
        </div>
      );
}

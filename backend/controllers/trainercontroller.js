const express = require('express');
const bcrypt=require('bcrypt')
const User=require('../model/user')
const jwt=require('jsonwebtoken')
const Trainer=require('../model/trainer')
const Message=require('../model/message')
const Task=require('../model/tasks')
require('dotenv').config()


module.exports={
    verifytoken:async(req,res)=>{
        const { token } = req.body;

        try {
          const decoded = jwt.verify(token, process.env.TRAINER_PASSWORD); // Verify the token
          res.status(200).json({ success: true, email: decoded.email });
        } catch (error) {
          res.status(400).json({ success: false, message: 'Invalid or expired token.' });
        }
    },



    createpassword:async(req,res)=>{
        const { token, password } = req.body;

        try {
          const decoded = jwt.verify(token, process.env.TRAINER_PASSWORD); // Verify the token
          const hashedPassword = await bcrypt.hash(password, 10);
      
          // Save the password in the database
          const trainer = await Trainer.findOneAndUpdate(
            { email: decoded.email },
            { password: hashedPassword },
            { new: true }
          );
      
          if (!trainer) {
            return res.status(404).json({ success: false, message: 'Trainer not found.' });
          }
      
          res.status(200).json({ success: true, message: 'Password created successfully!' });
        } catch (error) {
          console.error('Error creating password:', error);
          res.status(500).json({ success: false, message: 'Failed to create password.' });
        }
    },

    trainerlogin:async(req,res)=>{
        const { email, password } = req.body;

        try {
          // Find trainer by email
          const trainer = await Trainer.findOne({ email });
          if (!trainer) {
            return res.status(404).json({ success: false, message: "Trainer not found" });
          }
      
          // Verify password
          const isMatch = await bcrypt.compare(password, trainer.password);
          if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
          }
      
          // Generate token
          const token = jwt.sign({ id: trainer._id }, process.env.JWT_TRAINER_TOKEN, { expiresIn: "1h" });
      
          res.json({
            success: true,
            message: "Login successful",
            token,
            trainer: {
              id: trainer._id,
              name: trainer.name,
              email: trainer.email,
              phonenumber:trainer.phonenumber
              
            },
          });
        } catch (error) {
          console.error("Error during login:", error);
          res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    },

    mathctrainer:async(req,res)=>{
      const {userId}=req.body
      try {
        const user=await User.findById(userId)
        if(user.trainer){
          return res.status(400).json({message:'This user already have a trainer assigned'})
        }
        
        const matchedTrainer=await Trainer.find({
          skills:{$in:user.goals}
        })
    
        const bestTrainer=matchedTrainer.filter(trainer=>
          user.goals.some(goal=>trainer.skills.includes(goal))
        )
    
        if(bestTrainer.length===0){
          return res.status(400).json({message:'No trainers are available for these preferences and goals'})
        }
    
        const selectedTrainer=bestTrainer
        .sort((a,b)=>{
          const clientComparison=a.pendingClients.length-b.pendingClients.length
          if(clientComparison!==0){
            return clientComparison
          }

          const goalMatchA=user.goals.filter(goal=>a.skills.includes(goal)).length
          const goalMatchB=user.goals.filter(goal=>b.skills.includes(goal)).length
          return goalMatchB-goalMatchA
        })[0]
        console.log('Trainer selected',selectedTrainer.name)
      
        await Trainer.findByIdAndUpdate(selectedTrainer._id,{$push:{pendingClients:userId}})
        await User.findByIdAndUpdate(userId,{trainerStatus:'pending'})
        res.status(200).json({message:'Trainer assigned successfully',trainer:selectedTrainer})
      } catch (error) {
        
      }
     },


    
     acceptrejectclient:async(req,res)=>{
      const { userId,trainerId,decision}=req.body
      try {
        const trainer=await Trainer.findById(trainerId)
        const user=await User.findById(userId)
    
        if(decision==='reject'){
          await Trainer.findByIdAndUpdate(trainerId,{$pull:{pendingClients:userId}})
          await User.findByIdAndUpdate(userId,{trainerStatus:'pending'})


          const matchedTrainer = await Trainer.find({
            skills: { $in: user.goals },
            _id: { $ne: trainerId }, // Exclude current rejecting trainer
          });
    
          const nextBestTrainer = matchedTrainer
            .sort((a, b) => {
              const clientComparison = a.pendingClients.length - b.pendingClients.length;
              if (clientComparison !== 0) {
                return clientComparison;
              }
    
              const goalMatchA = user.goals.filter((goal) => a.skills.includes(goal)).length;
              const goalMatchB = user.goals.filter((goal) => b.skills.includes(goal)).length;
              return goalMatchB - goalMatchA;
            })[0];
    
          if (nextBestTrainer) {
            await Trainer.findByIdAndUpdate(nextBestTrainer._id, { $push: { pendingClients: userId } });
            console.log('trainer selected',nextBestTrainer.name)
            return res.status(200).json({ message: 'Client request reassigned to another trainer!' });
          } else {
            return res.status(400).json({ message: 'No other trainers are available for this client' });
          }
        }
    
        if(decision==='accept'){
          await Trainer.findByIdAndUpdate(trainerId,{$push:{clients:userId},$pull:{pendingClients:userId}})
          await User.findByIdAndUpdate(userId,{trainer:trainerId,trainerStatus:'assigned'})
    
          
          return res.status(200).json({message:'Client request accepted!!'})
        }
    
        res.status(400).json({message:'Invalid decison taken'})
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
      }
     },


     getpendingclients:async(req,res)=>{
      const {trainerId}=req.params
      try {
        const trainer=await Trainer.findById(trainerId).populate('pendingClients')
        if(!trainer){
          return res.status(400).json({message:'No trainer id found'})
        }
         res.status(200).json({
          message:'pending clinets fetched',
          pendingClients:trainer.pendingClients
         })

      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
      }
     },
     getclients:async(req,res)=>{
      const {trainerId}=req.query
      try {
        const trainer=await Trainer.findById(trainerId).populate('clients')
        res.json(trainer.clients)
      } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ error: 'Failed to fetch clients' });
      }
     },

     getmessages:async(req,res)=>{
      const {trainerId,clientId}=req.query
      try {
        const messages = await Message.find({
          $or: [
            { senderId: trainerId, receiverId: clientId },
            { senderId: clientId, receiverId: trainerId },
          ],
        }).sort({ timestamp: 1 });
    
        res.status(200).json(messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).send('Server error');
      }
     },
     

     assigntask:async(req,res)=>{
      const {trainerId,clientId,taskname,date}=req.body

      try {
        let tasklist=await Task.findOne({trainerId,clientId})
        if(!tasklist){
          tasklist=new Task({
           trainerId,
           clientId,
           tasks:[{taskname,completed:false,date}]
          })
        }
        else{
          tasklist.tasks.push({taskname,completed:false,date})
        }
        await tasklist.save()
        return res.status(200).json({task:tasklist.tasks[tasklist.tasks.length-1]})
      } catch (error) {
        
      }
     },

     gettasks:async(req,res)=>{
      const{trainerId,clientId}=req.params
      try {
        const tasklist=await Task.findOne({trainerId,clientId})
        if(tasklist){
          return res.status(200).json({success:true,tasks:tasklist.tasks})
        }
        else{
          return res.status(404).json({ message: 'No tasks found for this client',tasks:[] });
        }
      } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error });
      }
     },

     gettasksclient:async(req,res)=>{
      const {trainerId,clientId}=req.params
      try {
        const tasklist=await Task.findOne({trainerId,clientId})
        if(tasklist){
          return res.json({tasks:tasklist.tasks})
        }
        else{
          return res.status(404).json({ message: 'No tasks found for this client',tasks:[] });
        }
      } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error });
      }
     },

     updatetasks: async (req, res) => {
      const { trainerId, clientId, tasks } = req.body;
  
      try {
          const tasklist = await Task.findOne({ trainerId, clientId });
  
          if (tasklist) {
              // Check if any task's status has changed
              const tasksModified = tasklist.tasks.some((task, index) => {
                  return task.completed !== tasks[index].completed; // Check for differences in completion status
              });
  
              if (!tasksModified) {
                  return res.status(400).json({ success: false, message: 'Please Enter a task before submitting' });
              }
  
              tasklist.tasks = tasks; // Update the tasks array
              await tasklist.save();
  
              return res.status(200).json({ success: true, message: 'Tasks updated successfully.' });
          } else {
              return res.status(404).json({ success: false, message: 'Task list not found.' });
          }
      } catch (error) {
          console.error('Error updating tasks:', error);
          res.status(500).json({ message: 'Error updating tasks.', error });
      }
  },
  

     edittask: async (req, res) => {
      const { trainerId, clientId, taskId, updatedTaskname, updatedDate } = req.body;
  
      try {
          const tasklist = await Task.findOne({ trainerId, clientId });
          if (tasklist) {
              const task = tasklist.tasks.id(taskId);
              if (task) {
                  task.taskname = updatedTaskname || task.taskname;
                  task.date = updatedDate || task.date;
                  await tasklist.save();
                  return res.status(200).json({ message: 'Task updated successfully.', task });
              } else {
                  return res.status(404).json({ message: 'Task not found.' });
              }
          } else {
              return res.status(404).json({ message: 'Task list not found.' });
          }
      } catch (error) {
          console.error('Error updating task:', error);
          res.status(500).json({ message: 'Error updating task.', error });
      }
  },
  
  deletetask: async (req, res) => {
    const { trainerId, clientId, taskId } = req.body;

    try {
        const task = await Task.findOneAndUpdate(
            { trainerId, clientId },
            { $pull: { tasks: { _id: taskId } } },  // $pull removes the task with the given taskId from the tasks array
            { new: true }  // Return the updated document
        );

        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }
        res.status(200).json({ message: 'Task deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task.', error });
    }
  },

  filtertask:async(req,res)=>{
    const {trainerId,clientId,startDate,endDate}=req.body
    if (!trainerId || !clientId || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
    try {
      const tasks=await Task.findOne({
        trainerId,
        clientId,
        "tasks.date":{$gte:new Date(startDate),$lte:new Date(endDate)}
      })

      if(!tasks){
        return res.status(400).json({message:'No tasks found on given date'})
      }

      const filteredTasks = tasks.tasks.filter(
        (task) => 
          new Date(task.date) >= new Date(startDate) && 
          new Date(task.date) <= new Date(new Date(endDate).setHours(23, 59, 59, 999))
      )
      

      res.status(200).json({success:true,startDate,endDate,filteredTasks})
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "An error occurred while filtering tasks." });
    }
  },

  getclienttask:async(req,res)=>{
    const {trainerId,clientId}=req.query
    if (!trainerId || !clientId) {
      return res.status(400).json({ message: 'Missing trainerId or clientId' });
    }
  
    try {
      
      
      const today=new Date()
      today.setHours(0,0,0,0)
      const endofDay=new Date(today)
      endofDay.setHours(23,59,59,999)

      const taskData= await Task.findOne({
        trainerId,
        clientId,
        "tasks.date":{$gte:today,$lte:endofDay}
      }).populate('tasks')

      if (!taskData || taskData.tasks.length === 0) {
        return res.json({
          totalTasks: 0,
          completedTasks: 0,
          completionPercentage: 0
        });
      }

      const todayTasks=taskData.tasks.filter(task=>{
        const taskDate=new Date(task.date)
        return taskDate>=today && taskDate<= endofDay
      })

      const totalTasks=todayTasks.length
      const completedTasks=todayTasks.filter(task=>task.completed).length
      const completionPercentage= totalTasks>0?(completedTasks/totalTasks) *100 :0

      res.json({
        totalTasks,
        completedTasks,
        completionPercentage
      })
      


    } catch (error) {
      console.error(error);
        res.status(500).json({ message: 'Error fetching tasks' });
    }
  },

  getname:async(req,res)=>{
    try {
      const {clientId}=req.params
      const client=await User.findById(clientId)
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      res.json({client})
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
      console.log(error)
    }
  }






     
}
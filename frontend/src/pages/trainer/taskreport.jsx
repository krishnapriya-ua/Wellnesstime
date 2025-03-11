import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from "axios";
import logo from '../../assets/images/logo.png'
import { Link } from "react-router-dom";
import { CircularProgress, Card, CardContent, Box,Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { alignProperty } from "@mui/material/styles/cssUtils";


const TaskReport = () => {

  const navigate=useNavigate()

  const location = useLocation();

  const taskReport = location.state?.taskReport || {}; 

  const clientId=location.state?.clientId||{}

  const[client,setClient]=useState('')

  const filteredTasks = Array.isArray(taskReport.filteredTasks) ? taskReport.filteredTasks : [];

  if (filteredTasks.length === 0) {
    return (
      <div>
        <p>No tasks available for the selected date range.</p>
        <Link to="/trainer/taskbox">Back to Taskbox</Link>
      </div>
    );
  }

  if (clientId) {
    const fetchdetails = async () => {
    try {
          const response = await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/trainer/getname/${clientId}`);
          setClient(response.data.client);
        } catch (error) {
          console.log('ERROR', error);
        }
      };
      fetchdetails();
  }
  
  
  const handletaskbox = () => {
      navigate('/trainer/taskbox', { 
        state: { clientId, firstname: client.firstname, lastname: client.lastname }
      })
  };
  
  
 
  const calculateCompletion = (tasks) => {
    const completedTasks = tasks.filter((task) => task.completed).length;
    const totalTasks = tasks.length;
    return totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
  };

  const totalCompletionPercentage = calculateCompletion(filteredTasks);
  const completedTasks = filteredTasks.filter((task) => task.completed).length;
  const totalTasks = filteredTasks.length;

  


  const groupByDate = (tasks) => {
    return tasks.reduce((groups, task) => {
      const taskDate = new Date(task.date);
      const formattedDate = `${taskDate.getDate().toString().padStart(2, '0')}-${(taskDate.getMonth() + 1).toString().padStart(2, '0')}-${taskDate.getFullYear()}`;
     if (!groups[formattedDate]) {
        groups[formattedDate] = [];
      }
      groups[formattedDate].push(task); 
      return groups;
    }, {});
  };

 
  const groupedTasks = groupByDate(filteredTasks);


  const sortedDate = Object.keys(groupedTasks).sort((a, b) => {
    const [dayA, monthA, yearA] = a.split('-');
    const [dayB, monthB, yearB] = b.split('-');
  
    // Convert to Date object for comparison
    const dateA = new Date(`${monthA}-${dayA}-${yearA}`);
    const dateB = new Date(`${monthB}-${dayB}-${yearB}`);
  
    return dateA - dateB;
  });
  
  const downloadPDF = () => {
    const reportElement = document.querySelector('.report-container');
    const pdfButton = document.querySelector('.pdfbuttonn');
  
    if (pdfButton) {
      pdfButton.style.display = 'none';
    }
  
    const customStyles = {
      background: 'white',
      padding: '10px',
      marginBottom: '10px', 
    };
  
    Object.assign(reportElement.style, customStyles);
  
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
    const pdfHeight = pdf.internal.pageSize.getHeight() - 20; 


    pdf.setLineWidth(0.3); // Set thinner border thickness
    pdf.setDrawColor(0, 0, 0); // Black border color
  const borderMargin = 4; // Consistent margin for all sides
  pdf.rect(borderMargin, borderMargin, pdfWidth - borderMargin * 2, pdfHeight - borderMargin * 2);

    let yOffset = 10; 
  
   
    pdf.addImage(logo, 'JPEG', 10, yOffset, 20, 15); 
    yOffset += 30;
  
   
    pdf.setFontSize(14);
    pdf.setFont("helvetica");
    pdf.text('TASK REPORT', pdfWidth / 2, yOffset, { align: 'center' });
    yOffset += 20;
  
   
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text(` ${Math.round(totalCompletionPercentage)}% COMPLETED`, 10, yOffset);
    yOffset += 10;
  
   
    pdf.text(`${completedTasks} / ${totalTasks} TASKS COMPLETED `, 10, yOffset);
    yOffset += 20;

   
   
    sortedDate.forEach((date, index) => {
      const tasks = groupedTasks[date];
  
    
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text(date, 10, yOffset);
      yOffset += 10;
  
      
      pdf.setLineWidth(0.2); // Thinner line
      pdf.line(10, yOffset, pdfWidth - 10, yOffset);
      yOffset += 5;
  
      tasks.forEach((task) => {
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
  
      
        pdf.text(`${task.taskname.toUpperCase()} - ${task.completed ? 'COMPLETED' : 'PENDING'}`, 10, yOffset);
        yOffset += 10;
  
       
        if (yOffset > pdfHeight - 20) {
          pdf.addPage();
          pdf.rect(borderMargin, borderMargin, pdfWidth - borderMargin * 2, pdfHeight - borderMargin * 2);
        yOffset = 10; 
        }
      });
  
   
      yOffset += 10;
  
   
      if (yOffset > pdfHeight - 20) {
        pdf.addPage();
         pdf.rect(borderMargin, borderMargin, pdfWidth - borderMargin * 2, pdfHeight - borderMargin * 2);
      yOffset = 10;
      }
    });
  

  
    pdf.save('task_report.pdf');
  

    Object.keys(customStyles).forEach((key) => {
      reportElement.style[key] = '';
    });
  
    if (pdfButton) {
      pdfButton.style.display = 'inline-block';
    }
  };
  
  
  return (
    <div className="container my-5">
         <p style={{cursor:'pointer',textDecoration:'underline'}} onClick={handletaskbox}>Back to Taskbox</p>
    <div className="report-container">
      <div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img src={logo} alt="Wellness Time Logo" style={{ maxWidth: '99px' }} />
      </div>

      <h6 style={{textAlign:'center',letterSpacing:'1px',textTransform:'uppercase'}}>Task Report</h6>

    
      </div>
    
      <div className="d-flex justify-content-center mt-5 mb-2 position-relative">
        <CircularProgress
          variant="determinate"
          value={totalCompletionPercentage}
          color="black"  // Set the color to black
          size={40}
          thickness={3}
        />
       
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontWeight: "bold",
            fontSize: "12px",
          }}
        >
          {Math.round(totalCompletionPercentage.toFixed(2))}%
        </Box>
      </div>

    
       <h6 style={{fontSize:'x-small',textAlign:'center',textTransform:'uppercase'}}> {completedTasks} / {totalTasks} tasks completed</h6>
      
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10 col-sm-12">
          
          {sortedDate.map((date, index) => {
            const tasks = groupedTasks[date];

            return (
              <Card key={index} className="mb-4" style={{ boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)" }}>
                <CardContent>
                  <h6 style={{fontSize:'small'}} className="card-title mb-3">{date}</h6>

                  <ul className="list-group">
                    {tasks.map((task) => (
                      <li
                        style={{fontSize:'x-small',textTransform:'uppercase',letterSpacing:'1px'}}
                        key={task._id}
                        className={`list-group-item d-flex justify-content-between align-items-center ${
                          task.completed ? "list-group-item-success" : ""
                        }`}
                      >
                        {task.taskname}
                        <span className="badge" style={{color:'black',textTransform:'uppercase',letterSpacing:'1px',fontWeight:'400'}}>
                          {task.completed ? "Completed" : "Pending"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}

          <Button className="pdfbuttonn mb4" onClick={downloadPDF} style={{background:'black',color:'white',fontSize:'x-small'}}>Download pdf</Button>
          <p className="mt-5" style={{fontSize:'small'}}>Contact Us: <span  style={{fontSize:'small',color:'#0d0d7e',cursor:'pointer'}}> wellness time@gmail.com||kp@gmail.com</span></p>
      
        </div>
       
     
      </div>
      
      </div>    
    </div>
  );
};

export default TaskReport;

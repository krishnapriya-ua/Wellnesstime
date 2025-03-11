import React from 'react';
import { useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import '../../assets/styles/report.css';
import logo from '../../assets/images/logo.png'
import { Button } from '@mui/material';


export default function RevenueReport() {
  const location = useLocation();
  const reportData = location.state?.reportData;


  const totalRevenue = reportData?.filteredHistory?.reduce(
    (sum, record) => sum + (record.revenue || 0),
    0
  );


  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const downloadPDF = () => {

    const reportElement = document.querySelector('.report-content');

    const pdfButton = document.querySelector('.pdfbutton');
    if (pdfButton) {
      pdfButton.style.display = 'none';
    }
   
    const customStyles = {
      background: 'white', 
      padding: '20px',
      border: '1px solid black',
    };
  
    Object.assign(reportElement.style, customStyles);
  
    html2canvas(reportElement, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/jpeg',0.9);
      const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait, millimeters, A4 size
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20; // Adjust for margins
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  
      // Add the image with margins
      pdf.addImage(imgData, 'JPEG', 10, 10, pdfWidth, pdfHeight);
      pdf.save('revenue_report.pdf');
  
      // Reset styles after rendering
      Object.keys(customStyles).forEach((key) => {
        reportElement.style[key] = '';
      });
      if (pdfButton) {
        pdfButton.style.display = 'inline-block';
      }
    });
  };
  

  return (
    <div className="report-container container">
      <div className="report-content">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',marginBottom:'1rem' }}>
         <img src={logo} alt="Wellness Time Logo" style={{ maxWidth: '99px' }} />
        </div>
         <h6 className='text-center'>REVENUE REPORT</h6>

        <div className="revenue-content  mb-3">
          <p>From: {formatDate(reportData?.startDate) || 'N/A'}</p>
          <p>To: {formatDate(reportData?.endDate) || 'N/A'}</p>
        </div>
        <div className="revenue-table-container">
        <table className="revenue-table">
          <thead>
            <tr>
              <th>Date</th>
              
              <th>Name</th>
              <th>Email</th>
              <th>Plan</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {reportData?.filteredHistory?.length > 0 ? (
              reportData.filteredHistory.map((record, index) => (
                <tr key={index}>
                  <td>{formatDate(record.date)}</td>
                 
                  <td>{record.userName}</td>
                  <td>{record.userEmail}</td>
                  <td>{record.planName}</td>
                  <td>Rs. {record.revenue.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" style={{ textAlign: 'center' }}>No data available</td>
              </tr>
            )}
          </tbody>
         
        </table>
        </div>
        {reportData?.filteredHistory?.length > 0 && (
            <div className='my-3'>
           
            <p style={{ fontWeight: 'bold',textAlign:'end',fontSize:'small',marginRight:'1rem' }}>Total:Rs. {totalRevenue.toFixed(2)}</p>
            </div>
          )}
        <Button className="pdfbutton" onClick={downloadPDF}>
          Download PDF
        </Button>
       
      </div>
    </div>
  );
}

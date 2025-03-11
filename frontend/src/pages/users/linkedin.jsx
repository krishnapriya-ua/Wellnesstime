import React from 'react';
import { LinkedIn } from 'react-linkedin-login-oauth2';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import linkedinLogo from 'react-linkedin-login-oauth2/assets/linkedin.png';

const LinkedInPage = () => {
  const navigate = useNavigate();

  const handleSuccess = (data) => {
    // When LinkedIn login is successful, send the code to the backend
    axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/auth/linkedin/callback`, { code: data.code })
      .then(response => {
        console.log('LinkedIn login successful', response.data);
        navigate('/'); // Redirect to the dashboard or homepage after success
      })
      .catch(error => {
        console.error('Error during LinkedIn login:', error);
      });
  };

  const handleFailure = (error) => {
    console.error('LinkedIn login failed:', error);
  };

  return (
    <div>
      <LinkedIn
        clientId={process.env.REACT_APP_LINKEDIN_CLIENT_ID}
        onFailure={handleFailure}
        onSuccess={handleSuccess}
        redirectUri={process.env.REACT_APP_LINKEDIN_REDIRECT_URI}
      >
        <button style={{ maxWidth: '180px', padding: '10px', backgroundColor: '#0077b5', border: 'none', borderRadius: '5px' }}>
          <img src={linkedinLogo} alt="Log in with LinkedIn" style={{ maxWidth: '18px', marginRight: '8px' }} />
          Continue with LinkedIn
        </button>
      </LinkedIn>
    </div>
  );
};

export default LinkedInPage;

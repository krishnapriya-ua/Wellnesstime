const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const User = require('../model/user');
const jwt = require('jsonwebtoken');
const jwt_accesskey = process.env.JWT_SECRET_KEY;



const jwt_linkedinkey=process.env.JWT_LINKEDIN_KEY
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;

const scope = 'r_liteprofile r_emailaddress';
async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Ensure this is correct
    });
    const payload = ticket.getPayload();
    return payload;
  } catch (error) {
    console.error("Error verifying token:", error);
    throw new Error('Invalid Google token');
  }
}

router.post('/google/callback', async (req, res) => {
  const { token } = req.body;

  try {
    const googleUser = await verifyGoogleToken(token); // Token verification
    console.log("Google User:", googleUser); // Debugging line

 
 
    let user = await User.findOne({ googleId: googleUser.sub });
    if (user) {

      if (user.blocked) {
        return res.status(400).json({ success: false, message: 'Sorry, this account is blocked', blocked: true });
      }
  
      // User exists, send back user data along with token
      const jwtToken = jwt.sign(
        { userId: user._id, email: user.email, firstname: user.firstname, lastname: user.lastname,blocked:user.blocked },
        jwt_accesskey,
        { expiresIn: '12h' }
      );
      return res.json({ success: true, token: jwtToken, user: user ,blocked:user.blocked});
    }

    const generateRandomPhoneNumber = () => {
      return `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    };
    

    user = new User({
      googleId: googleUser.sub,
      firstname: googleUser.given_name || '',  // Fallback
      lastname: googleUser.family_name || '',  // Fallback
      email: googleUser.email || '',
    
      password:googleUser.password||'',
      phonenumber:googleUser.phonenumber|| generateRandomPhoneNumber(),
      blocked:false
    });

    await user.save();

    // Generate JWT for the newly created user
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email, firstname: user.firstname, lastname: user.lastname ,phonenumber:user.phonenumber,blocked:user.blocked},
      jwt_accesskey,
      { expiresIn: '12h' }
    );

    return res.json({ success: true,firstname:user.firstname,email:user.email,phonenumber:user.phonenumber,blocked:user.blocked, token: jwtToken, user: user,userId:user._id });
  } catch (error) {
    console.error("Error during Google login:", error);
    return res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
});
 


// router.post('/linkedin/callback', async (req, res) => {
//   try {
//     const { code } = req.body;  // You should receive the code here
//     console.log('Code:', code);

//     // Send code back to frontend or process it as needed
//     res.status(200).json({ code });

//   } catch (error) {
//     console.error('Error during LinkedIn callback:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

router.get('/linkedin/callback', async (req, res) => {
  const { code } = req.body;  // The code sent from frontend

  if (!code) {
    return res.status(400).json({ success: false, message: 'Authorization code missing' });
  }

  try {
    // Step 2.1: Exchange authorization code for access token
    const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
    const response = await axios.post(tokenUrl, null, {
      params: {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: LINKEDIN_REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
      },
      
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const accessToken = response.data.access_token; // Access token from LinkedIn

    // Step 2.2: Fetch the user's LinkedIn profile using the access token
    const linkedinResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const linkedinUser = linkedinResponse.data;

    // Step 2.3: Check if the user already exists in the database
    let user = await User.findOne({ linkedinId: linkedinUser.id });

    if (user) {
      if (user.blocked) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been blocked.',
          blocked: true,
        });
      }

      // User exists, generate JWT token and return user data
      const jwtToken = jwt.sign(
        { userId: user._id, email: user.email, firstname: user.firstname, lastname: user.lastname },
        jwt_linkedinkey,
        { expiresIn: '12h' }
      );

      return res.json({ success: true, token: jwtToken, user: user });
    }

    // Step 2.4: If new user, create a user in DB
    user = new User({
      linkedinId: linkedinUser.id,
      firstname: linkedinUser.firstName || 'No Firstname',
      lastname: linkedinUser.lastName || 'No Lastname',
      email: linkedinUser.emailAddress || 'No Email',
      profilephoto: linkedinUser.profilePicture || '',
      blocked: false,
    });

    await user.save();

    // Generate JWT token for the new user
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email, firstname: user.firstname, lastname: user.lastname },
      jwt_linkedinkey,
      { expiresIn: '12h' }
    );

    return res.json({ success: true, token: jwtToken, user: user });
  } catch (error) {
    console.error("Error during LinkedIn login:", error);
    return res.status(500).json({ success: false, message: 'LinkedIn login failed', error: error.message });
  }
});

module.exports = router;

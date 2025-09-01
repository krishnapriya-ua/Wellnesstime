const express = require('express');
const bcrypt=require('bcrypt')
const User=require('../model/user')
const jwt=require('jsonwebtoken')
const nodemailer=require('nodemailer')
const Trainer=require('../model/trainer')
const Feedback=require('../model/feedback')
const crypto=require('crypto')
const Razorpay = require('razorpay')
const Admin=require('../model/admin')
const schedule=require('node-schedule')
const mailpassword = process.env.MAIL_PASSWORD
 

const revokePremiumJob = schedule.scheduleJob('0 0 * * *', async () => {
  try {
    const now = new Date();
    const expiredUsers = await User.find({ premium: true, premiumExpiresAt: { $lte: now } });

    expiredUsers.forEach(async (user) => {
      user.premium = false;
      user.premiumExpiresAt = null;
      await user.save();
    });

    console.log(`Premium status revoked for ${expiredUsers.length} users.`);
  } catch (error) {
    console.error('Error revoking premium status:', error);
  }
});


require('dotenv').config()
const jwt_accesskey=process.env.JWT_SECRET_KEY

const resettoken=process.env.JWT_RESET_TOKEN


const razorpay = new Razorpay({
  key_id:process.env.RAZORPAY_KEY_ID,
  key_secret:process.env.RAZORPAY_KEY_SECRET

})

module.exports={
  generateOtp(){
    return crypto.randomInt(100000, 999999).toString(); 
  },
  postsignup: async (req, res) => {
    try {
      const { firstname, lastname, email, password, phonenumber } = req.body;
      const usedemail = await User.findOne({ email });
  
      if (usedemail) {
        return res.status(400).json({ message: 'This email is already in use' });
      }
      const userphone = await User.findOne({ phonenumber });
  
      if (userphone) {
        return res.status(400).json({ message: 'This phonenumber is already in use' });
      }
  
      const hashedpassword = await bcrypt.hash(password, 10);
      const user = new User({ firstname, lastname, email, password: hashedpassword, phonenumber });
  
      // Generate OTP (random 6 digit code)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpiry = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
  
      // Save user with hashed password and OTP before sending email
      await user.save();
     
      // Send OTP (this is just an example using nodemailer for email)
      const transporter = nodemailer.createTransport({
        service: 'gmail', // Replace with your email service
        auth: {
          user: 'krishnapriyaua@gmail.com',
          pass: mailpassword
        },
      });
  
      const mailOptions = {
        from: 'krishnapriyaua@gmail.com',
        to: email,
        subject: 'Your OTP for Verification',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border: 1px solid #dddddd; border-radius: 8px;">
              <tr>
               
              </tr>
              <tr>
                <td align="center" style="background-color: black; color: #ffffff; padding: 20px; font-size: 19px; font-weight: bold;">
                  Verify Your Account
                </td>
              </tr>
              <tr>
                <td style="padding: 20px; text-align: center; color: #555555; font-size: 16px; line-height: 1.5;">
                  <p>Hi ${firstname},</p>
                  <p>Your One-Time Password (OTP) for verifying your account is:</p>
                  <h2 style="color: black; font-size: 32px; margin: 20px 0;">${otp}</h2>
                  <p>This OTP is valid for <strong>10 minutes</strong>. Please use it to complete your verification process.</p>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding: 20px;">
                  <p style="color: #999999; font-size: 12px;">If you did not request this email, please ignore it.</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px; text-align: center; color: black; font-size: 14px;">
                  WELLNESS TIME - FEEL YOUR BEST<br>
                  | <a href="#" style="color: black; text-decoration: none;">Privacy Policy</a> | <a href="#" style="color: black; text-decoration: none;">Contact Support</a> |
                </td>
              </tr>
            </table>
          </div>
        `,
      };
  
      // Send the email with OTP
      transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          console.log('Error sending OTP:', error);
          return res.status(500).json({ message: 'Failed to send OTP' });
        }
  
        res.json({ success: true, message: 'User registered successfully. OTP sent to your email/phone.' });
      });
    } catch (error) {
      res.status(500).json({ error: 'Error registering user' });
    }
  },
  
  verifyotp: async (req, res) => {
    const { email, otp } = req.body;
  
    try {
      // Find the user based on email
      const user = await User.findOne({ email });
  
      // If the user is not found or OTP is incorrect, return an error
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      if (user.otp !== otp) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
      }
  
      // If the OTP has expired
      if (Date.now() > user.otpExpiry) {
        return res.status(400).json({ success: false, message: 'OTP has expired' });
      }
  
      // OTP is valid, now clear OTP and OTP expiry
      user.otp = null;  // Clear OTP after successful verification
      user.otpExpiry = null;
      user.isVerified = true;  // Clear expiry time after successful verification
  
      // Save the user to the database
      await user.save();
  
      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        jwt_accesskey,
        { expiresIn: '12h' }
      );
  
      res.json({
        success: true,
        message: 'OTP verified successfully',
        token,
        userId: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phonenumber: user.phonenumber,
      });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ success: false, message: 'Error verifying OTP' });
    }
  },
  
  postlogin: async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
  
      if (!user) {
        return res.status(400).json({ success: false, message: 'User not found' });
      }
  
      if (user.blocked) {
        return res.status(400).json({ success: false, message: 'Sorry, this account is blocked', blocked: true });
      }
  
     
  
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
  
      if (!isPasswordCorrect) {
        return res.status(400).json({ success: false, message: 'Incorrect email or password' });
      }
      if (!user.isVerified) {
        return res.status(400).json({ success: false, message: 'Please verify your OTP before logging in.' });
      }
  
      const token = jwt.sign({ userId: user._id, email: user.email }, jwt_accesskey, { expiresIn: '12h' });
  
      return res.status(200).json({
        success: true,
        token,
        blocked: user.blocked,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        userId: user._id,
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ success: false, message: 'Error logging in user' });
    }
  },
  
  
 forgotpassword:async(req,res)=>{
    const {email}=req.body
    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }
    try {
        const user=await User.findOne({email})
        if(!user){
            console.log('Email not found:', email); 
            return res.status(400).json({message:'user not found'})
        }
        const resetToken=jwt.sign({email},resettoken,{expiresIn:'1h'})
        const resetlink=`${process.env.FRONTEND_MAIN_ROUTE}/reset-password?token=${resetToken}`;
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'krishnapriyaua@gmail.com',
                pass: mailpassword
            }
        });

        const mailOptions = {
            from: 'krishnapriyaua@gmail.com',
            to: email,
            subject: 'Password Reset',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: white;">
  
            <h2 style="text-align: center; color: #333;">Password Reset Request</h2>
                <p style="font-size: 16px; color: #555;">Hey ${user.firstname.toLowerCase()},</p>
                <p style="font-size: 16px; color: #555;">
                    We received a request to reset your password. If this was you, click the button below to reset your password:
                </p>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${resetlink}" style="padding: 10px 20px; font-size: 16px; color: white; background-color: #007bff; text-decoration: none; border-radius: 5px;">
                        Click Here to Reset
                    </a>
                </div>
                <p style="font-size: 14px;">
                    If this was not you, please ignore this email. Your password will remain safe.
                </p>
                <p style="font-size: 14px; ">Thank you,</p>
                <p style="font-size: 14px;">Wellness Time Team</p>
            </div>
            `,
        };
        
        await transporter.sendMail(mailOptions)
        res.status(200).json({ message: 'Password reset email sent successfully.' });
    } catch (error) {
      res.status(500).json({ message: 'Error sending email.', error });
    }
   
},

resetpassword:async(req,res)=>{
    const { token, password } = req.body;

    try {
        // Verify the token
        const decoded = jwt.verify(token,resettoken);

        // Find the user
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid token or user does not exist.' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password reset successful.' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token.' });
    }
},


isblocked:async(req,res)=>{
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, blocked: user.blocked });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
},


addtrainerapplicant:async(req,res)=>{
    const { name, email, skills, phonenumber, experience } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Profile photo is required' });
    }
  
    // Validate email
    const existingUser = await Trainer.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'This Email already exists' });
    }
  
    // Validate phone number
    const existingUserByPhone = await Trainer.findOne({ phonenumber });
    if (existingUserByPhone) {
      return res.status(400).json({ success: false, message: 'This phone number already exists' });
    }
  
   
    try {
      const trainer = new Trainer({
        name,
        email,
        skills: skills.split(','),
        phonenumber,
        experience,
        profilephoto: req.file.path,
        status: 'pending', 
      });

      await trainer.save();
      res.status(201).json({success:true, message: 'Trainer application submitted successfully. Awaiting approval.' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to submit trainer application' });
    }
},


getuser:async(req,res)=>{
  try {
    const userId=req.params.id
    const user=await User.findById(userId).select('profilephoto')
    if(!user){
      res.status(400).json({message:'couldnt fetch photo'})
    }
    res.status(200).json({profilephoto:user.profilephoto})
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error });
    
  }
},

 
saveworkout:async(req,res)=>{
  const{userId,workoutId,workoutName,duration}=req.body
  try {
    const user=await User.findById(userId)
    if(user){
      user.workouts.push({
        workoutId,workoutName,duration
      })
      await user.save()
      res.status(200).json({message:'workout details saved successfully'})
    }
    else{
      res.status(400).json({message:'failed to save workout data'})
    }

  } catch (error) {
    res.status(500).json({error:'failed to save workout data'})
  }

},

gettopworkout:async(req,res)=>{
  const {userId}=req.params;
  try {
    const user=await User.findById(userId)
    if(!user){
      return res.status(400).json({message:'failed to fetch workout data'})
    }
    const workoutSummary=user.workouts.reduce((acc,workout)=>{
      if(!acc[workout.workoutName]){
       acc[ workout.workoutName]=workout.duration
      }
      else{
        acc[workout.workoutName]+=workout.duration
      }
      return acc
    },{})


    const sortedWorkouts=Object.entries(workoutSummary)
    .sort(([,durationA],[,durationB])=>durationB-durationA)
    .slice(0,4)
    .map(([workoutName,totalDuration])=>({workoutName,totalDuration}))
    res.status(200).json({success:true,sortedWorkouts})
  } catch (error) {
    console.error('Error fetching top workouts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch top workouts' });
  }
},


getworkoutdata:async(req,res)=>{
  const { userId,startDate,endDate } = req.query;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'Failed to fetch workout data' });
    }

   const filteredproducts=user.workouts.filter(workout=>{
    return(
      new Date(workout.date) >= new Date(startDate) &&
       new Date(workout.date) <= new Date(endDate)
    )
   })
   res.status(200).json(filteredproducts)
   
  } catch (error) {
    console.error('Error fetching workout data:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch workout data' });
  }
},


createorder:async(req,res)=>{
  try {
    const{amount,currency,userId,planDuration}=req.body
    console.log('Amount received in backend (in paise):', amount); // Should be 39900
    console.log('Currency received:', currency); // Should be 'INR'

    const options={
      amount:amount,
      currency:currency||'INR',
      receipt:`receipt_${Date.now()}`,
      notes:{
        userId:userId,
        planDuration
      }
    }

    const order=await razorpay.orders.create(options)
    console.log('Razorpay order amount:', order.amount);
    res.status(200).json({success:true,order})
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
},

 verifypayment : async (req, res) => {
  try {
    const {razorpay_payment_id,razorpay_order_id,razorpay_signature} = req.body

    
    if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.redirect(`${process.env.FRONTEND_MAIN_ROUTE}/payment-failed`);

    const orderDetails = await razorpay.orders.fetch(razorpay_order_id)
    if(!orderDetails) return res.status(400).json({success:false,message:'Invalid Order ID'})
    
    const {userId,planDuration} = orderDetails.notes
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is missing' });
    }


    // Verify the Razorpay signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(201).json({ success: false, message: 'Payment verification failed' });
    }

    console.log('Verifying payment:', { razorpay_order_id, razorpay_payment_id, razorpay_signature });
    console.log('Generated Signature:', generatedSignature);
    console.log('Razorpay Signature:', razorpay_signature);
    console.log('User ID:', userId);
    console.log('Plan Duration:', planDuration);


    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.premium) {
      console.log('member is already premium')
      return res.status(400).json({ success: false, message: 'User is already a premium member' });
    }

    // Calculate premium expiration date
    const currentDate = new Date();
    let premiumExpiresAt;
    let planCost;
    let planName;

    if (planDuration === "month") {
      premiumExpiresAt = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
      planCost = 399;
      planName='Monthly Plan'
    } else if (planDuration === "6_months") {
      premiumExpiresAt = new Date(currentDate.setMonth(currentDate.getMonth() + 6));
      planCost = 2399;
      planName='6-Month Plan'
    } else if (planDuration === "year") {
      premiumExpiresAt = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1));
      planCost = 4099;
      planName='Yearly Plan'
    }

   
    user.premium = true;
    user.premiumExpiresAt = premiumExpiresAt;
    await user.save();

    
    const today = new Date().toISOString().split('T')[0]; 
    const userName=`${user.firstname} ${user.lastname}`
    const revenueEntry= {
      date:today,
      revenue:planCost,
      userName,
      userEmail:user.email,
      planName
    }
    const admin = await Admin.findOne({});

    if (admin) {
      admin.revenueHistory.push(revenueEntry)
      admin.totalRevenue+=planCost
      await admin.save()
    } else {
      // Create a new admin document if it doesn't exist
      const newAdmin = new Admin({
        totalRevenue: planCost,
        revenueHistory: [revenueEntry],
      });
      await newAdmin.save();
    }

    res.redirect(`${process.env.FRONTEND_MAIN_ROUTE}/premium/premiumuser`);
  } catch (error) {
    console.error('Error in payment verification:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
},

  failedpayment:async(req,res)=>{
    res.redirect(`${process.env.FRONTEND_MAIN_ROUTE}/payment-failed`);

  },

 premiumdetails:async(req,res)=>{
  try {
    const{userId,preferences,goals,height,weight,sleepSchedule,diet}=req.body
    const user=await User.findById(userId)
    if(!user){
      return res.status(400).json({message:'user not found'})

    }

    user.preferences=preferences;
    user.goals=goals
    user.height=height
    user.weight=weight
    user.sleepSchedule=sleepSchedule
    user.diet=diet

    await user.save()

    res.status(200).json({message:'User data updated successfully'})
  } catch (error) {
    
  }
 },
 getpremiummembers:async(req,res)=>{
  try {
    const premiumusers=await User.find({premium:true})
    res.status(200).json(premiumusers)
  } catch (error) {
    console.log(error)
    return res.status(500).json({message:'couldnt fetch premium users'})
  }
 },
 gettrainer:async(req,res)=>{
  const {clientId}=req.params
  try {
    const client=await User.findById(clientId).populate('trainer')
    if(!client||!client.trainer){
      return res.status(400).json({message:'no trainer found for this user'})
    }
    const trainer=client.trainer
  
    res.json(trainer)
  } catch (error) {
    console.error('Error fetching trainer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
 },

 postfeedback:async(req,res)=>{
  try {
    const {feedbackText,userId}=req.body
    if(!userId||!feedbackText){
      return res.status(400).json({message:'userid and feedback not recieved '})
    }

    const feedback=new Feedback({userId,feedbackText})
    await feedback.save()
    res.status(200).json({message:'Feedback uploaded successfully'})
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error submitting feedback' });
  }
 },

 getfeedback:async(req,res)=>{
  try {
    const feedback=await Feedback.find()
       .populate('userId','firstname lastname profilephoto')
       .sort({createdAt:-1})

    res.json(feedback)
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching feedback' });
  }
 },


 updatephysique:async(req,res)=>{
   const {userId,height}=req.body
   const weight=req.body.Weight
  
   if(!userId||!height||!weight){
    return res.status(400).json({message:'all feilds are necessary'})
   }

   try {
    const user=await User.findByIdAndUpdate(userId,{height,weight},{new:true})
    if(!user){
      return res.status(400).json({message:'user not found'})
    }

    res.status(200).json({success:true,message:'physical details updated successfully',user})
   } catch (error) {
    console.error(error);
    res.status(500).json({success:false, message: 'An error occurred while updating details.' });
   }
 },

 getuserdetails:async(req,res)=>{
  const {userId}=req.params
  try {
    const user = await User.findById(userId,'height weight')

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching user details.' });
  }
 },

 checkpremium:async(req,res)=>{
  const {userId}=req.params
  try {
    
    const user=await User.findById(userId)
    if(!user){
      return res.status(400).json({message:'no user found'})
    }
    res.json({premium:user.premium})
  } catch (error) {
    res.status(500).json({ message: 'Error fetching premium status' });
  }
 }





 

}
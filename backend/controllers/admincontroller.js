const express=require('express')
const nodemailer = require('nodemailer');
const jwt=require('jsonwebtoken')
const bcrypt=require('bcrypt')
const User=require('../model/user')
const Workout=require('../model/workout')
const Music=require('../model/music')
const Trainer=require('../model/trainer');
const Admin = require('../model/admin');


require('dotenv').config()
const jwt_adminaccesskey=process.env.JWT_ADMINACCESSKEY;



module.exports={

    postlogin:async(req,res)=>{
        const{username,password}=req.body
        if(username===process.env.ADMIN_USERNAME&&password===process.env.ADMIN_PASSWORD){
         const token=jwt.sign({role:'admin'},jwt_adminaccesskey,{expiresIn:'12hr'})
         res.status(200).json({success:true,token})
        }
        else{
            res.status(400).json({success:false,message:'error login user'})
        }
    },
    getdashboard:async(req,res)=>{
        res.status(200).json({ message: 'Welcome to the Admin Dashboard' });
    },
    getuser:async(req,res)=>{
        const { search } = req.query;
        try {
            const query = search
                ? {
                      $or: [
                          { firstname: { $regex: search, $options: 'i' } },
                          { lastname: { $regex: search, $options: 'i' } },
                          { email: { $regex: search, $options: 'i' } },
                      ],
                  }
                : {};
            const users = await User.find(query).sort({createdAt:-1}).populate('trainer','name');

            const userswithStatus=users.map(user=>({
              ...user.toObject(),
              trainerPending:user.trainerStatus==='pending'
            }))
            res.status(200).json({ success: true, users:userswithStatus });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching users' });
        }
    },
    searchuser:async(req,res)=>{
        try {
            const searchQuery = req.query.search || '';
            const users = await User.find({ name: { $regex: searchQuery, $options: 'i' } }).sort({ createdAt: -1 });
            res.status(200).json({ success: true, users });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching users' });
        }
    },
    edituser:async(req,res)=>{
        try {
            const userId=req.params.id
            const{firstname,lastname,email,phonenumber}=req.body
            const existingUser = await User.findOne({ email, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'This Email already exists' });
            }
            const existingphone = await User.findOne({ phonenumber, _id: { $ne: userId } });
            if (existingphone) {
                return res.status(400).json({ success: false, message: 'This phonenumber already exists' });
            }
            const phoneRegex = /^[0-9]{10}$/; // Adjust regex to match your country's phone number format
            if (phonenumber && !phoneRegex.test(phonenumber)) {
                return res.status(400).json({ success: false, message: 'Invalid phone number' });
            }
    
            const updateUser=await User.findByIdAndUpdate(userId,{firstname,lastname,phonenumber,email},{new:true})
            if(!updateUser){
                res.status(400).json({message:'user not found', success:false})
            }
           
            res.json({success:true,updateUser})
         } catch (error) {
            res.status(500).json({success:false,message:'server error'})
         }
    },
    deleteuser:async(req,res)=>{
        try {
            const userId=req.params.id
            const deleteUser=await User.findByIdAndDelete(userId)
            if(!deleteUser){
                res.status(400).json({message:'user not found', success:false})
    
            }
            res.json({success:true,message:'user deleted successfully'})
    
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ success: false, message: 'Server error' });
     
        }
    },
    adduser: async (req, res) => {
        try {
            const { firstname, lastname, email, password, phonenumber } = req.body;

          
            // Check if the email already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'This Email already exists' });
            }
            const existingUserByPhone = await User.findOne({ phonenumber });
            if (existingUserByPhone) {
                return res.status(400).json({ success: false, message: 'This phone number already exists' });
            }
            const phoneRegex = /^[0-9]{10}$/; // Adjust regex to match your country's phone number format
            if (phonenumber && !phoneRegex.test(phonenumber)) {
                return res.status(400).json({ success: false, message: 'Invalid phone number' });
            }
    
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new user
            const newUser = new User({
                firstname,
                lastname,
                email,
                password: hashedPassword,
                phonenumber,
                isVerified:true
            });

            await newUser.save();
            res.status(200).json({ success: true, message: 'User added successfully', user: newUser });
        } catch (error) {
            console.error('Error adding user:', error);
            res.status(500).json({ success: false, message: 'Failed to add user' });
        }
    },
    blockuser:async(req,res)=>{
        try {
            const { id } = req.params;
            const user = await User.findById(id);
        
            if (!user) {
              return res.status(404).json({ success: false, message: 'User not found' });
            }
        
            user.blocked = !user.blocked; // Toggle the blocked status
            await user.save();
        
            res.json({
              success: true,
              message: user.blocked ? 'User blocked successfully' : 'User unblocked successfully',
            });
          } catch (error) {
            res.status(500).json({ success: false, message: 'Server error' });
          }
    },
    unblockuser:async(req,res)=>{
        try {
            const { userId } = req.params;
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
            user.status = 'active';  // Update user status to 'active'
            await user.save();
            res.json({ success: true, message: 'User unblocked successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },
    createworkout:async(req,res)=>{
        try {
            const { name, description,musicIds } = req.body;
            const existingWorkout = await Workout.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
            if (existingWorkout) {
              return res.status(400).json({ success: false, message: 'Workout with this name already exists' });
            }
            const photoPaths = req.files.map((file) => file.path);
            
            const workout = new Workout({ name, description, photos: photoPaths,music:musicIds });
          
            await workout.save();
        
            res.status(201).json({ success: true, workout });
          } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: 'Error creating workout' });
          }
    },
    listworkout:async(req,res)=>{
        try {
           
            const search = req.query.search || '';
            const workouts = await Workout.find({
                name: { $regex: search, $options: 'i' }, // Case-insensitive search
              });
            res.status(200).json({ success: true, workouts });
          } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: 'Error fetching workouts' });
          }
    },
    deleteworkout:async(req,res)=>{
        try {
            await Workout.findByIdAndDelete(req.params.id);
            res.status(200).json({ success: true });
          } catch (error) {
            res.status(500).json({ success: false, error: 'Error deleting workout' });
          }
    },
    editworkout:async(req,res)=>{
        const { id } = req.params;
       const { name, description } = req.body;
      const newPhotos = req.files.map((file) => file.path);

    try {
    const workout = await Workout.findById(id);

    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }
    const existingWorkout = await Workout.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id }  // Ensure it’s not the current workout being edited
      });
  
      if (existingWorkout) {
        return res.status(400).json({ success: false, message: 'Workout with this name already exists' });
      }
    // Update fields
    workout.name = name || workout.name;
    workout.description = description || workout.description;

    // If new photos are uploaded, replace the old ones
    if (newPhotos.length) {
      workout.photos = newPhotos;
    }
   

    await workout.save();

      res.status(200).json({ success: true, message: 'Workout updated successfully', workout });
    } catch (error) {
      console.error('Error updating workout:', error);
       res.status(500).json({ success: false, message: 'Failed to update workout' });
      }
    },
    getworkout:async(req,res)=>{
        try {
            // Fetch all workouts from the database
            const workouts = await Workout.find({});
            
            // Return the list of workouts
            res.json(workouts);
          } catch (error) {
            console.error('Error fetching workouts:', error);
            res.status(500).json({ error: 'Error fetching workouts' });
          }
    },
    workoutid: async (req, res) => {
        const { id } = req.params;
        try {
          const workout = await Workout.findById(id).populate('music'); // Populate music field
          if (!workout) {
            return res.status(404).json({ success: false, message: 'Workout not found' });
          }
     
          res.json(workout);
        } catch (error) {
          console.error('Error fetching workout:', error);
          res.status(500).json({ message: 'Error fetching workout', error });
        }
      },
    addmusic:async(req,res)=>{
        try {
            const{name,category}=req.body
            const filepath=req.files.map((file)=>file.path)
            const music=new Music({
                name,
                files:filepath,
               
                category: Array.isArray(category) ? category : category.split(','),
            })
            await music.save()
            res.status(200).json({success:true,message:'Music added successfully'})

        } catch (error) {
           res.status(500).json({success:false,message:'Error adding music',error})
            
        }
    },
    listmusic:async(req,res)=>{
        try {
            const music=await Music.find()
            res.status(200).json(music)
        } catch (error) {
            res.status(500).json({success:false,message:'Error adding music',error})
            
        }
    },
    deletemusic:async(req,res)=>{
        try {
            const{id}=req.params
            await Music.findByIdAndDelete(id)
            res.status(200).json({success:true,message:'Music deleted successfully'})

        } catch (error) {
            res.status(500).json({message:'error deleting music',error})
        }
    },
    editmusic:async(req,res)=>{
        const{id}=req.params
        const{name,category}=req.body
        const musicFiles=req.files.map((file)=>file.path)
        try {
            const music=await Music.findById(id)
            if(!music){
                return res.status(400).json({message:'music not found'})
            }
            music.name=name||music.name
            music.category = Array.isArray(category) ? category : category.split(',');
            if(musicFiles.length){
                music.files=musicFiles
            }
            await music.save()
            res.status(200).json({success:true,message:'music updated succesfulyy',music})
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to update music' });
        }
    },
    getcategories:async(req,res)=>{
        try {
            const categories=await Workout.find().select('name')
            res.status(200).json(categories)
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching categories', error });

        }
    },
    addtrainer:async(req,res)=>{
        const { name, email, skills, phonenumber, experience } = req.body;
        if (!req.file) {
           return res.status(400).json({ error: 'Profile photo is required' });
        }
        const existingUser = await Trainer.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'This Email already exists' });
            }
            const existingUserByPhone = await Trainer.findOne({ phonenumber });
            if (existingUserByPhone) {
                return res.status(400).json({ success: false, message: 'This phone number already exists' });
            }
            const phoneRegex = /^[0-9]{10}$/; // Adjust regex to match your country's phone number format
            if (phonenumber && !phoneRegex.test(phonenumber)) {
                return res.status(400).json({ success: false, message: 'Invalid phone number' });
            }
        try {
   
        const trainer = new Trainer({
        name,
        email,
        skills: skills.split(','),
        phonenumber,
        experience,
        profilephoto: req.file.path,
        status:'accepted'
      });
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'krishnapriyaua@gmail.com', 
          pass: 'txej uvva mwtl nzsq'      
        }
      });
      const token=jwt.sign({email:trainer.email},process.env.TRAINER_PASSWORD,{expiresIn:'1hr'})
      const link=`${process.env.FRONTEND_MAIN_ROUTE}/trainer/create-password?token=${token}`
      const acceptMailOptions = {
        from: 'krishnapriyaua@gmail.com',
        to: trainer.email, // Send the email to the applicant's email
        subject: `Congratulations, ${trainer.name}! Your application has been accepted.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
            <h2 style="text-align: center; color: #333;">Application Status Update</h2>
            <p style="font-size: 16px; color: #555;">Dear ${trainer.name},</p>
            <p style="font-size: 16px; color: #555;">
              We are pleased to inform you that your application has been <strong>Accepted</strong>!
            </p>
            <p style="font-size: 16px; color: #555;">
              Congratulations! We are excited to welcome you to the Wellness Time team. We believe your skills and experience will be a great addition to our organization.
            </p>
              <p style="font-size: 16px; color: #555;">
      To access your dashboard and start your journey with us, please click the link below to set your password:
    </p>
    <p style="text-align: center; margin: 20px 0;">
      <a href="${link}" style="font-size: 16px; color: #fff; background-color: black; text-decoration: none; padding: 10px 20px; border-radius: 5px;">
       click here
      </a>
    </p>
    <p style="font-size: 14px; color: #555;">This link is valid for 1 hour. If you didn’t apply or have questions, please contact us.</p>
  
            <p style="font-size: 14px;">Thank you,</p>
            <p style="font-size: 14px;">Wellness Time Team</p>
          </div>
        `,
      };
      const mailOptions = acceptMailOptions ;

      
      // Send the email
      await transporter.sendMail(mailOptions);
      await trainer.save();
      res.status(201).json({ message: 'Trainer added successfully' });
      } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to add trainer' });
      }
    },
    listtrainer:async(req,res)=>{
      
        try {
            const trainer=await Trainer.find({status:'accepted'}).populate('clients','firstname')
            const sanitizedTrainers = trainer.map(trainer => ({
              ...trainer._doc,
              clients: trainer.clients || [],
            }));
            res.json(sanitizedTrainers)
        } 
        catch (error) {
            res.status(500).json({ message: 'Error fetching trainers' });
        }
       

    },
    edittrainer:async(req,res)=>{
        const{id}=req.params
        const{name,email,phonenumber,skills,experience}=req.body
        
        try {
            const trainer=await Trainer.findById(id)
            if(!trainer){
                return res.status(400).json({message:'music not found'})
            }
            const existingUser = await Trainer.findOne({ email, _id: { $ne: id } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'This Email already exists' });
            }
            const existingphone = await Trainer.findOne({ phonenumber, _id: { $ne: id } });
            if (existingphone) {
                return res.status(400).json({ success: false, message: 'This phonenumber already exists' });
            }
            const phoneRegex = /^[0-9]{10}$/; // Adjust regex to match your country's phone number format
            if (phonenumber && !phoneRegex.test(phonenumber)) {
                return res.status(400).json({ success: false, message: 'Invalid phone number' });
            }
            trainer.name=name||trainer.name
            trainer.email=email||trainer.email
            trainer.phonenumber=phonenumber||trainer.phonenumber
            trainer.experience=experience||trainer.experience
            trainer.skills = skills ? skills.split(',') : trainer.skills; 

            
            if (req.file) {
                trainer.profilephoto = req.file.path;
              }
          
          
            await trainer.save()
            res.status(200).json({success:true,message:'trainer updated succesfulyy',trainer})
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to update trainer' });
        }
    },
    deletetrainer:async(req,res)=>{
        try {
            const{id}=req.params
            await Trainer.findByIdAndDelete(id)
            res.status(200).json({success:true,message:'Trainer deleted successfully'})

        } catch (error) {
            res.status(500).json({message:'error deleting trainer',error})
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
            status: 'pending', // New trainers are set as 'pending'
          });
      console.log(trainer)
          await trainer.save();
          res.status(201).json({success:true, message: 'Trainer application submitted successfully. Awaiting approval.' });
        } catch (error) {
          console.log(error);
          res.status(500).json({ error: 'Failed to submit trainer application' });
        }
    },
    getapplicants:async(req,res)=>{
        try {
            const applicants=await Trainer.find({status:'pending'})
            res.status(200).json(applicants)
        } catch (error) {
            res.status(500).json({error:'couldnt fetch applicants'})
        }
    },
    updatestatus : async (req, res) => {
        const { applicantId, status } = req.body; // applicantId and status ('accepted' or 'rejected')
      
        // Validate the status
        if (!['accepted', 'rejected'].includes(status)) {
          return res.status(400).json({ error: 'Invalid status' });
        }
      
        try {
          // Find the applicant and update their status
          const applicant = await Trainer.findByIdAndUpdate(applicantId, { status }, { new: true });
          if (!applicant) {
            return res.status(404).json({ error: 'Applicant not found' });
          }
          
      
          // Set up email transporter
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'krishnapriyaua@gmail.com', // Replace with your email
              pass: 'txej uvva mwtl nzsq'       // Replace with your email password or app password
            }
          });
          const token=jwt.sign({email:applicant.email},process.env.TRAINER_PASSWORD,{expiresIn:'1hr'})
          const link=`${process.env.FRONTEND_MAIN_ROUTE}/trainer/create-password?token=${token}`
          const acceptMailOptions = {
            from: 'krishnapriyaua@gmail.com',
            to: applicant.email, // Send the email to the applicant's email
            subject: `Congratulations, ${applicant.name}! Your application has been accepted.`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                <h2 style="text-align: center; color: #333;">Application Status Update</h2>
                <p style="font-size: 16px; color: #555;">Dear ${applicant.name},</p>
                <p style="font-size: 16px; color: #555;">
                  We are pleased to inform you that your application has been <strong>Accepted</strong>!
                </p>
                <p style="font-size: 16px; color: #555;">
                  Congratulations! We are excited to welcome you to the Wellness Time team. We believe your skills and experience will be a great addition to our organization.
                </p>
                  <p style="font-size: 16px; color: #555;">
          To access your dashboard and start your journey with us, please click the link below to set your password:
        </p>
        <p style="text-align: center; margin: 20px 0;">
          <a href="${link}" style="font-size: 16px; color: #fff; background-color: black; text-decoration: none; padding: 10px 20px; border-radius: 5px;">
           click here
          </a>
        </p>
        <p style="font-size: 14px; color: #555;">This link is valid for 1 hour. If you didn’t apply or have questions, please contact us.</p>
      
                <p style="font-size: 14px;">Thank you,</p>
                <p style="font-size: 14px;">Wellness Time Team</p>
              </div>
            `,
          };
      
          // Prepare the email content for Rejection
          const rejectMailOptions = {
            from: 'krishnapriyaua@gmail.com',
            to: applicant.email, // Send the email to the applicant's email
            subject: `Dear ${applicant.name}, Your application status: Rejected`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                <h2 style="text-align: center; color: #333;">Application Status Update</h2>
                <p style="font-size: 16px; color: #555;">Dear ${applicant.name},</p>
                <p style="font-size: 16px; color: #555;">
                  We regret to inform you that your application has been <strong>Rejected</strong>.
                </p>
                <p style="font-size: 16px; color: #555;">
                  We appreciate your interest in Wellness Time and thank you for the time and effort you put into your application. Unfortunately, we are unable to offer you a position at this time.
                </p>
                <p style="font-size: 14px;">
                  We encourage you to continue exploring other opportunities. Best of luck in your future endeavors.
                </p>
                <p style="font-size: 14px;">
                  If you have any questions or would like feedback, feel free to reach out to us.
                </p>
                <p style="font-size: 14px;">Thank you,</p>
                <p style="font-size: 14px;">Wellness Time Team</p>
              </div>
            `,
          };
          // Prepare the email content
          const mailOptions = status === 'accepted' ? acceptMailOptions : rejectMailOptions;

      
          // Send the email
          await transporter.sendMail(mailOptions);
          if (status === 'rejected') {
            await Trainer.findByIdAndDelete(applicantId);
          }
      
          // Respond with success message
          res.status(200).json({ message: `Applicant ${status} and email sent.` });
        } catch (error) {
          console.error('Error updating status or sending email:', error);
          res.status(500).json({ error: 'Failed to update applicant status or send email' });
        }
      },

      uploadphoto:async(req,res)=>{
        try {
          const {userId}=req.body
          const photopath=req.file.path
          await User.findByIdAndUpdate(userId,{profilephoto:photopath})
          res.status(200).json({success:true,message:'Profile photo uploaded'})
        } catch (error) {
          res.status(500).json({error:'failed to upload photo'})
          console.log(error)
          
        }
      },

      getdetails:async(req,res)=>{
        try {
          const totalusers=await User.countDocuments()
          const premiumusers=await User.countDocuments({premium:true})
          const totaltrainers=await Trainer.countDocuments()
          const admin=await Admin.findOne()
          const totalRevenue=admin?admin.totalRevenue:0;

          res.json({
            totalusers,
            premiumusers,
            totaltrainers,
            totalRevenue
          })
        } catch (error) {
          console.error('Error fetching stats:', error);
          res.status(500).json({ error: 'Failed to fetch stats' });
        }
      },

      getrevenuehistory:async(req,res)=>{
        try {
          const admin=await Admin.findOne({})
          if(!admin){
            return res.json({message:'Admin not found'})
          }
          res.json({revenueHistory:admin.revenueHistory})
        } catch (error) {
          console.log(error)
        }
      },

      gettopworkout:async(req,res)=>{
        try {
          const topWorkouts=await User.aggregate([
            {$unwind:'$workouts'},
            {$group:{
              _id:'$workouts.workoutId',
              totalDuration:{$sum:'$workouts.duration'}
            }},
            {$lookup:{
              from:'workouts',
              localField:'_id',
              foreignField:'_id',
              as:'workoutDetails'
            }},
            {$unwind:'$workoutDetails'},
            {$sort:{totalDuration:-1}},
            {$limit:5}
          ])

          res.status(200).json(topWorkouts)
        } catch (error) {
          res.status(500).json({ message: 'Error fetching top workouts', error });
        }
      },

      gettoptrainer:async(req,res)=>{
        try {
          const topTrainers=await Trainer.aggregate([
            {$project:{
              trainerId:'$_id',
              clientCount:{$size:'$clients'},
              name:'$name'
            }},
            {$sort:{clientCount:-1}},
            {$limit:5},
            {$lookup:{
              from:'trainers',
              localField:'trainerId',
              foreignField:'_id',
              as:'trainerDetails'
            }}
          ])

          res.status(200).json(topTrainers)
        } catch (error) {
          res.status(500).json({ message: 'Error fetching top trainers', error });
        }
      },

      get_best_trainer:async(req,res)=>{
        const {userId}=req.query;
       
        try {
          const user=await User.findById(userId)
          if(!user){
            return res.status(400).json({message:'The user not exist in db'})

          }

          const matchedTrainer=await Trainer.find({
            skills:{$in:user.goals},
          })

          if(matchedTrainer.length===0){
            return res.status(400).json({messagae:'No matching trainer for this user yet'})
          }

          const trainerWithUser=await Trainer.find({
            pendingClients:userId
          })

          const traineridwithuser=trainerWithUser.map(trainer=>trainer._id.toString())



          const availableTrainers=matchedTrainer.filter(
            trainer=>!traineridwithuser.includes(trainer._id.toString())
          )
         

          res.status(200).json({trainers:availableTrainers,trainerWithUser})
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Something went wrong' });
        }
      },

      assign_trainer:async(req,res)=>{
        const { userId, newtrainerId } = req.body;
  
        try {
          // Get the user
          const user = await User.findById(userId);
          if (!user) {
            return res.status(400).json({ message: 'User not found' });
          }
      
          // Get the new trainer
          const newTrainer = await Trainer.findById(newtrainerId);
          if (!newTrainer) {
            return res.status(400).json({ message: 'New trainer not found' });
          }
      
          // If the user already has a pending trainer (rejected or not assigned yet)
          if (user.trainerStatus === 'pending') {
            // Remove the user from the current trainer's pendingClients (if any)
            await Trainer.updateMany(
              { pendingClients: userId },
              { $pull: { pendingClients: userId } }
            );
          }
      
          // Add the user to the new trainer's pendingClients
          await Trainer.findByIdAndUpdate(newtrainerId, {
            $push: { pendingClients: userId }
          });
      
          // Update the user's trainer assignment and status
          await User.findByIdAndUpdate(userId, {
            trainerStatus: 'pending',  // Or set to 'assigned' if you want immediate assignment
          });

          console.log(newTrainer.name,'The new trainer assinged by trainer is ')
      
          res.status(200).json({ message: 'Trainer reassigned successfully' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Something went wrong' });
        }
      },


      revenue_report:async(req,res)=>{
        const {startDate,endDate}=req.body
        try {
          const admin=await Admin.findOne({})
          if(!admin){
            return res.status(400).json({message:'Admin not found'})
          }

          const filteredHistory=admin.revenueHistory.filter((record)=>{
            const recordDate=new Date(record.date)
            return recordDate >= new Date (startDate) && recordDate <= new Date (endDate)
          })

          res.json({startDate,endDate,filteredHistory})
        } catch (error) {
          console.error('Error fetching revenue report:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      }
}
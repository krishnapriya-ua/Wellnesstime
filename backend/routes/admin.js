const express=require('express')
const router=express.Router()
const jwt=require('jsonwebtoken')
const multer=require('multer')
const path=require('path')
const User=require('../model/user')

require('dotenv').config()
const jwt_adminaccesskey=process.env.JWT_ADMINACCESSKEY
const admincontroller=require('../controllers/admincontroller')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Save files in 'uploads/' directory
    },
    filename: (req, file, cb) => {
        cb(null,Date.now()+path.extname(file.originalname))
    },
  });
  const upload = multer({ storage });


const verifyAdminToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) return res.status(403).json({ message: 'Access denied' });
    
    jwt.verify(token, jwt_adminaccesskey, (err, decoded) => {
        if (err || decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    });
};
const userblocked = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId); // Fetch user by ID (ensure you're passing userId as a parameter)
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' }); // Return error if user doesn't exist
        }

        if (user.blocked) {
            return res.status(400).json({ message: 'Account is blocked' }); // Return blocked error if user is blocked
        }

        // Continue with the next logic (e.g., return user data if not blocked)
        return res.status(200).json({ message: 'Account is active', user });
    } catch (error) {
        console.error('Error checking blocked status:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};


router.post('/login',admincontroller.postlogin)

router.get('/admin/dashboard', verifyAdminToken,admincontroller.getdashboard);

router.get('/users',verifyAdminToken,admincontroller.getuser)

router.get('/searchusers',admincontroller.searchuser);

router.put('/users/:id',verifyAdminToken,admincontroller.edituser)

router.delete('/users/:id',verifyAdminToken,admincontroller.deleteuser)



router.post('/users',verifyAdminToken,admincontroller.adduser)

router.put('/users/block/:id', verifyAdminToken, admincontroller.blockuser);

router.put('/users/unblock/:id', verifyAdminToken, admincontroller.unblockuser);

router.post('/workout',upload.array('photos',4),admincontroller.createworkout)

router.get('/listworkout',admincontroller.listworkout) 

router.delete('/workout/:id',admincontroller.deleteworkout)

router.put('/workout/:id',upload.array('photos',4),admincontroller.editworkout)

router.get('/workouts',admincontroller.getworkout)

router.get('/workout/:id',admincontroller.workoutid)

router.post('/addmusic',upload.array('music'),admincontroller.addmusic)

router.get('/listmusic',admincontroller.listmusic)

router.delete('/music/:id',admincontroller.deletemusic)

router.put('/music/:id',upload.array('music'),admincontroller.editmusic)

router.get('/getcategories',admincontroller.getcategories)

router.post('/addtrainer',upload.single('photo'),admincontroller.addtrainer)

router.get('/listtrainer',admincontroller.listtrainer)

router.put('/edittrainer/:id',upload.single('photo'),admincontroller.edittrainer)

router.delete('/deletetrainer/:id',admincontroller.deletetrainer)

router.post('/trainer',upload.single('photo'),admincontroller.addtrainerapplicant)

router.get('/applicants',admincontroller.getapplicants)

router.post('/update-status',admincontroller.updatestatus)

router.post('/upload-photo',upload.single('profilephoto'),admincontroller.uploadphoto)

router.get('/details',admincontroller.getdetails)

router.get('/revenue-history',admincontroller.getrevenuehistory)

router.get('/get-top-workouts',admincontroller.gettopworkout)

router.get('/get-top-trainers',admincontroller.gettoptrainer)

router.get('/get-best-trainer',admincontroller.get_best_trainer)

router.post('/assign-new-trainer',admincontroller.assign_trainer)

router.post('/revenue-report',admincontroller.revenue_report)

module.exports=router
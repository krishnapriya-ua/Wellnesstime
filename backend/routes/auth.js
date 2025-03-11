//auth.js
const express=require('express')
const router=express.Router()
const usercontroller=require('../controllers/usercontroller')


const {getMusicByCategory}=require('../controllers/musiccontroller')



router.post('/signup',usercontroller.postsignup);

router.post('/login',usercontroller.postlogin);

router.post('/forgotpassword',usercontroller.forgotpassword)

router.post('/resetpassword',usercontroller.resetpassword)

router.get('/is-blocked/:id',usercontroller.isblocked)

router.get('/music', getMusicByCategory);

router.post('/verify-otp',usercontroller.verifyotp)

router.get('/get-user/:id',usercontroller.getuser)

router.post('/save-workout',usercontroller.saveworkout)

router.get('/users/:userId/top-workouts',usercontroller.gettopworkout)

router.get('/getworkoutdata',usercontroller.getworkoutdata)

router.post('/create-order',usercontroller.createorder)

router.post('/verify-payment',usercontroller.verifypayment)

router.get('/failed-payment',usercontroller.failedpayment)

router.post('/premium-details',usercontroller.premiumdetails)

router.get('/getpremium',usercontroller.getpremiummembers)

router.get('/gettrainer/:clientId',usercontroller.gettrainer)

router.post('/feedback',usercontroller.postfeedback)

router.get('/feedback',usercontroller.getfeedback)

router.put('/update-physical-details',usercontroller.updatephysique)

router.get('/get-user-details/:userId',usercontroller.getuserdetails)

router.get('/getpremium/:userId',usercontroller.checkpremium)



  
module.exports=router
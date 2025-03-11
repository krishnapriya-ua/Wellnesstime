const express=require('express')
const router=express.Router()
const trainercontroller=require('../controllers/trainercontroller')

router.post('/verify-token',trainercontroller.verifytoken)

router.post('/create-password',trainercontroller.createpassword)

router.post('/login',trainercontroller.trainerlogin)


router.post('/match-trainer',trainercontroller.mathctrainer)

router.post('/accept-rejectclient',trainercontroller.acceptrejectclient)

router.get('/:trainerId/pending-clients',trainercontroller.getpendingclients)

router.get('/getclients',trainercontroller.getclients)

router.get('/get-messages',trainercontroller.getmessages)

router.post('/tasks/assign',trainercontroller.assigntask)

router.get('/tasks/:trainerId/:clientId',trainercontroller.gettasks)

router.get('/gettasks/:trainerId/:clientId',trainercontroller.gettasksclient)

router.put('/updatetasks',trainercontroller.updatetasks)

router.put('/tasks/edit', trainercontroller.edittask);

router.delete('/tasks/delete',trainercontroller.deletetask)

router.post('/filter-task',trainercontroller.filtertask)

router.get('/getclienttasks',trainercontroller.getclienttask)

router.get('/getname/:clientId',trainercontroller.getname)

module.exports=router
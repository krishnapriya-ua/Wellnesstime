const express = require('express');
const mongoose = require('mongoose');
const http=require('http')
const {initializeSocket}=require('./socket')
const cors = require('cors');
const userroutes=require('./routes/auth')
const adminroutes=require('./routes/admin')
const googleroutes=require('./routes/google')
const trainerroutes=require('./routes/trainer')
const path=require('path')
const connectDB=require('./config')
const passport=require('passport')
const session=require('express-session')
const Message=require('./model/message')


const app = express(); 

const server=http.createServer(app)


initializeSocket(server)


app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(
  session({
    secret: 'your_secret_key', 
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
//app.use(passport.session());




  // app.use((req, res, next) => {
  //   res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  //   res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp'); 
  //   next();
  // });

  
  const corsOptions = {
    origin: [process.env.FRONTEND_MAIN_ROUTE, 'https://checkout.razorpay.com'], // Allowed origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    credentials: true, // Allow credentials (cookies, etc.)
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  };
  


app.use(cors(corsOptions));

// Cross-Origin Policies
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp'); 
  next();
});

connectDB()
  
app.use('/api/userroute',userroutes)
app.use('/api/admin',adminroutes)
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth',googleroutes)
app.use('/api/trainer',trainerroutes)

app.use(express.static(path.join(__dirname,'../frontend/build')))

app.get('*',(req,res,next)=>{
  res.sendFile(path.join(__dirname,"../frontend/build",'index.html'))
})



const PORT = process.env.PORT; 
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

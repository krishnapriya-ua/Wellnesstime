import { BrowserRouter,Routes,Route } from "react-router-dom";
import React from "react";
import Userroute from "./userroute";
import AdminRoute from "./adminroute";
import TrainerRoute from "./trainerroute";
import Blogroute from "./blogroute";



function App() {
  return (

      <BrowserRouter>
      <Routes>
   
  
       <Route path="/*" element={<Userroute/>} />
       <Route path="/admin/*" element={<AdminRoute/>} />
       <Route path="/trainer/*" element={<TrainerRoute/>} />
       <Route path="/blogs/*" element={<Blogroute/>} />
       
    
      </Routes>
 
      </BrowserRouter>

  );
}

export default App;

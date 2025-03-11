import {Routes, Route,useLocation} from "react-router-dom";
import React, {Suspense, lazy} from "react";
import Forbiddenpage from "../pages/users/forbiddenpage";
import Footer from "../pages/users/footer";

const Blogpage=lazy(()=>import('../pages/blogs/blog'))
const SleepHealth=lazy(()=>import('../pages/blogs/sleep'))
const StrengthTraining=lazy(()=>import('../pages/blogs/workout'))
const NutritionWellness=lazy(()=>import('../pages/blogs/nutrition'))
const MindfulnessMeditation=lazy(()=>import('../pages/blogs/meditation'))

function Blogroute() {
    const location=useLocation()
    const hideFooterRoutes = ['/otp','/403','*'];

    const showFooter = !hideFooterRoutes.includes(location.pathname) && location.pathname !== '*';

    return (
        <Suspense fallback={<div> Loading Trainer Pages ...</div>}>
            <Routes>
               <Route path="/" element={<Blogpage />}/>
               <Route path="/sleep-healthylifestyle" element={<SleepHealth/>}/>   
               <Route path="/strengthtraining" element={<StrengthTraining/>}/>        
               <Route path="/role-of-nutrition" element={<NutritionWellness/>}/>   
               <Route path="/benefits-of-meditation" element={<MindfulnessMeditation/>}/>               
                <Route path="/403" element={<Forbiddenpage />}/>
                <Route path="*" element={<Forbiddenpage />}/>
            </Routes>
             {showFooter && <Footer />} 
        </Suspense>
    )
}
export default Blogroute;
import {Routes, Route,Navigate} from "react-router-dom";
import React, {Suspense, lazy} from "react";
import Forbiddenpage from "../pages/users/forbiddenpage";

const Createpassword = lazy(() => import ("../pages/trainer/create-password"));
const LoginPage = lazy(() => import ("../pages/trainer/login"));
const Dashboard = lazy(() => import ("../pages/trainer/dashboard"));
const Clients = lazy(() => import ("../pages/trainer/clients"));
const Chatbox = lazy(() => import ("../pages/trainer/chatbox"));
const TrainerprotectedRoute=lazy(()=>import("../pages/trainer/protectedroute"))
const TrainerTaskbox=lazy(()=>import("../pages/trainer/taskbox"))
const Taskreport=lazy(()=>import("../pages/trainer/taskreport"))


function TrainerRoute() {
    return (
        <Suspense fallback={<div> Loading Trainer Pages ...</div>}>
            <Routes>
            <Route path="/" element={<Navigate to="/trainer/login" replace />} />
                <Route path="/create-password" element={<Createpassword />}/>
                <Route path="/login" element={<LoginPage />}/>
                 <Route element={<TrainerprotectedRoute />}>
                 <Route path="/dashboard" element={<Dashboard />}/>
                 <Route path="/clients" element={<Clients />}/>
                 <Route path="/chatbox" element={<Chatbox/>}/>
                 <Route path="/taskbox" element={<TrainerTaskbox/>}/>
                 <Route path="/taskreport" element={<Taskreport/>}/>
                 </Route>
                

                <Route path="/403" element={<Forbiddenpage />}/>
                <Route path="*" element={<Forbiddenpage />}/>
            </Routes>
        </Suspense>
    )
}
export default TrainerRoute;
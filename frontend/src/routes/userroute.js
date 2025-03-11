import { Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import ErrorBoundary from "../pages/users/errorboundary";
import Forbiddenpage from "../pages/users/forbiddenpage";
import Footer from "../pages/users/footer";
const Homepage = lazy(() => import('../pages/users/homepage'));
const Login = lazy(() => import('../pages/users/login'));
const Signup = lazy(() => import('../pages/users/signup'));
const Forgot = lazy(() => import('../pages/users/forgotpass'));
const Userprofile = lazy(() => import('../pages/users/userprofile'));
const ChooseWorkout = lazy(() => import('../pages/users/workout'));
const Timer = lazy(() => import('../pages/users/timer'));
const Startworkout = lazy(() => import('../pages/users/startworkout'));
const Premiumpage = lazy(() => import('../pages/users/premiumpage'));
const Joinus = lazy(() => import('../pages/users/joinus'));
const UserProtectedRoute = lazy(() => import('../pages/users/userprotected'));
const ResetPassword = lazy(() => import('../pages/users/resetpassword'));
const OTPVerification=lazy(()=>import('../pages/users/otp'))
const Premiummember = lazy(()=>import('../pages/users/premiummember'))
const Premiumuserprofile=lazy(()=>import('../pages/users/pre-userprofile'))
const Clientchat=lazy(()=>import('../pages/users/trainerchat'))
const Clienttasks=lazy(()=>import('../pages/users/tasks'))
const About=lazy(()=>import('../pages/users/about'))
const Feedback=lazy(()=>import('../pages/users/feedback'))
const PaymentFailed=lazy(()=>import('../pages/users/payment-partial/razorpay-fail'))


function Userroute() {
    const location=useLocation()
    const hideFooterRoutes = ['/otp','/403','*','/premium/chat-with-trainer'];

    const showFooter = !hideFooterRoutes.includes(location.pathname) && location.pathname !== '*';
    return (
        <ErrorBoundary>
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgotpassword" element={<Forgot />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/select-workout" element={<ChooseWorkout />} />
                    <Route path="/premium" element={<Premiumpage />} />
                    <Route path="/join-us" element={<Joinus />} />
                    <Route path="/otp" element={<OTPVerification />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/feedback" element={<Feedback />} />
                   
                    <Route element={<UserProtectedRoute />}>
                       <Route path="/premium-userprofile" element={<Premiumuserprofile />} />
                        <Route path="/userprofile" element={<Userprofile />} />
                        <Route path="/timer/:id" element={<Timer />} />
                        <Route path="/workout/:id" element={<Startworkout />} />
                        <Route path="/premium/premiumuser" element={<Premiummember/>}/>
                        <Route path="/premium/chat-with-trainer" element={<Clientchat/>}/>
                        <Route path="/premium/tasks" element={<Clienttasks/>}/>
                        <Route path="/payment-failed" element={<PaymentFailed/>}/>
                    </Route>
                    <Route path="/403" element={<Forbiddenpage />} />
                    <Route path="*" element={<Forbiddenpage />} />
                </Routes>
             
        {showFooter && <Footer />} 
            </Suspense>
        </ErrorBoundary>
    );
}

export default Userroute;

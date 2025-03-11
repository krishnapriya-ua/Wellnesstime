import { Routes, Route, Navigate } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import Forbiddenpage from "../pages/users/forbiddenpage";
const Admindashboard = lazy(() => import("../pages/admin/admin-dash"));
const Admin = lazy(() => import("../pages/admin/adminlogin"));
const AdminProtectedRoute = lazy(() => import("../pages/users/protectedroute"));
const Users = lazy(() => import("../pages/admin/users"));
const Workout = lazy(() => import("../pages/admin/workout"));
const Music = lazy(() => import("../pages/admin/music"));
const Trainer = lazy(() => import("../pages/admin/trainer"));
const Newapplicants = lazy(() => import("../pages/admin/newapplicants"));
const RevenueReport=lazy(()=>import("../pages/admin/report"))

function AdminRoute() {
    return (
        <Suspense fallback={<div>Loading Admin Pages...</div>}>
            <Routes>
                <Route path="/" element={<Navigate to="/admin/login" replace />} />
                <Route path="/login" element={<Admin />} />
                <Route element={<AdminProtectedRoute />}>
                    <Route path="/dashboard" element={<Admindashboard />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/workout" element={<Workout />} />
                    <Route path="/music" element={<Music />} />
                    <Route path="/trainer" element={<Trainer />} />
                    <Route path="/new-applicants" element={<Newapplicants />} />
                    <Route path="/revenue-report" element={<RevenueReport />} />
                </Route>
                <Route path="/403" element={<Forbiddenpage />} />
                <Route path="*" element={<Forbiddenpage />} />
            </Routes>
        </Suspense>
    );
}

export default AdminRoute;

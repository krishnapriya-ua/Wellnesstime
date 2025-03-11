import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AdminProtectedRoute() {
    const isAuthenticated = useSelector((state)=>state.admin.isAuthenticated)

    return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" />;
}

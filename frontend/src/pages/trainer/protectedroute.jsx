import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function TrainerprotectedRoute() {
    const token = useSelector((state)=>state.trainer.token)

    return token ? <Outlet /> : <Navigate to="/trainer/login" />;
}

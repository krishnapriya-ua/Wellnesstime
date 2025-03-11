import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { logout } from '../../redux/slices/userSlice';
import { toast } from 'react-toastify';

export function BlockCheck() {
   
    const dispatch = useDispatch();
    const userId = useSelector((state) => state.user.userId); // Get user ID from Redux state

    useEffect(() => {
        const checkBlocked = async () => {
            if (!userId) return; // If not logged in, no need to check

            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/userroute/is-blocked/${userId}`);
                if (response.data.blocked) {
                   
                    toast.error('You are blocked by the admin');
                    dispatch(logout()); // Log out the user
                }
            } catch (error) {
                console.error('Error checking blocked status:', error);
            }
        };

        const interval = setInterval(checkBlocked, 25000); // Check every 5 seconds
        return () => clearInterval(interval); // Clean up interval on component unmount
    }, [userId, dispatch]);

    return null; // This component doesn’t render anything
}

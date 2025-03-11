import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import swal from 'sweetalert';


export default function PaymentFailed() {
    
    const navigate = useNavigate()

    useEffect(()=>{
        swal({
            icon:'error',
            title:'Payment Failed',
            confirmButtonText:'OK'
        }).then((res)=>{
            if(res) {
                navigate("/premium", { replace: true });
            }
        })

        setTimeout(()=>{
            swal.close();
            navigate("/premium", { replace: true });
        },3000)
    },[])
    
    
}
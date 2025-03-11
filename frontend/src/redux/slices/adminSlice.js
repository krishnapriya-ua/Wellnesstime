import { createSlice } from "@reduxjs/toolkit";
const initialState={
 
    token:'',
    isAuthenticated:false,
    error:null
}
const adminslice= createSlice({
  name:'admin',
  initialState,
  reducers:{
    setAdmin:(state,action)=>{
      
        state.token=action.payload.token
        state.isAuthenticated=true
        state.error=false
    },
    logoutAdmin:(state)=>{
     
        state.token=''
        state.isAuthenticated=false
    },
    setAdminError:(state,action)=>{
        state.error=action.payload?.message||action.payload

    }
  }

})

export const {setAdmin,logoutAdmin,setAdminError}=adminslice.actions
export default adminslice.reducer
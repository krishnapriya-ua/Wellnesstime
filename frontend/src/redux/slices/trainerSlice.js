//userslice.js
import {createSlice} from '@reduxjs/toolkit'
const initialState = {
    trainerId:'',
    token:'',
    name: '',
    email: '',
    phonenumber:'',
    isAuthenticated: false,
    error:null,
    

};
const trainerSlice = createSlice({
    name: 'trainer',
    initialState, 
    reducers: {
        setTrainer: (state, action) => {
            state.trainerId=action.payload.trainerId
            state.token=action.payload.token
            state.name = action.payload.name;
         
            state.email = action.payload.email;
            state.phonenumber=action.payload.phonenumber;
            state.isAuthenticated = true;
            state.error=null;
        },
        Trainerlogout: (state) => {
            state.trainerId=''
            state.token=''
            state.name = '';
            state.email = '';
            state.phonenumber='';
            state.isAuthenticated = false;
           
        },
        setError(state, action) {
            state.error = action.payload?.message||action.payload;
        },
       
       
    },
});

export const {setTrainer,Trainerlogout,setError }=trainerSlice.actions;
export default trainerSlice.reducer;
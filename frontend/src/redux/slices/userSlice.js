//userslice.js
import {createSlice} from '@reduxjs/toolkit'
const initialState = {
    userId:'',
    token:'',
    firstname: '',
    lastname:'',
    email: '',
    phonenumber:'',
    isAuthenticated: false,
    error:null,
    blocked:false,
    premium:false,
    profilephoto:'',
    height:null,
    weight:null

};
const userSlice = createSlice({
    name: 'user',
    initialState, 
    reducers: {
        setUser: (state, action) => {
            state.userId=action.payload.userId
            state.token=action.payload.token
            state.firstname = action.payload.firstname;
            state.lastname=action.payload.lastname
            state.email = action.payload.email;
            state.phonenumber=action.payload.phonenumber;
            state.isAuthenticated = true;
            state.blocked=action.payload.blocked||false;
            state.error=null;
            state.premium=action.payload.premium||false;
            state.profilephoto=action.payload.profilephoto;
            state.height=action.payload.height;
            state.weight=action.payload.weight
        },
        updatePhysicalDetails: (state, action) => {
            state.height = action.payload.height;
            state.weight = action.payload.weight;
          },
        logout: (state) => {
            state.userId=''
            state.token=''
            state.firstname = '';
            state.lastname='';
            state.email = '';
            state.phonenumber='';
            state.isAuthenticated = false;
            state.blocked=false;
            state.profilephoto=''
        
        },
        setError(state, action) {
            state.error = action.payload?.message||action.payload;
        },
        setBlocked: (state, action) => {
            state.blocked = action.payload;
        },
        setPremium:(state,action) =>{
            state.premium=action.payload
        }
       
    },
});

export const {setUser,logout,setError,setBlocked,setPremium,updatePhysicalDetails }=userSlice.actions;
export default userSlice.reducer;
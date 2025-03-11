
import { createSlice } from "@reduxjs/toolkit";
const timerSlice=createSlice({
    name:'timer',
    initialState:{
        currentWorkout:null,
        selectedTime:300,
        workInterval:0,
        restInterval:0
    },
    reducers:{
        startWorkout:(state,action)=>{
            const{workoutId,workoutName,selectedTime,workInterval,restInterval}=action.payload
            state.currentWorkout={
                workoutId,
                workoutName,
                selectedTime,
                elapsedTime:0,
                workInterval,
                restInterval
            }
            state.selectedTime=selectedTime;
            state.workInterval=workInterval;
            state.restInterval=restInterval;


        },
        updateElapsedTime:(state,action)=>{
            if(state.currentWorkout){
                state.currentWorkout.elapsedTime=action.payload
            }

        },
        stopWorkout:(state,action)=>{
            state.currentWorkout=null
            state.selectedTime=0
            state.workInterval=0
            state.restInterval=0
        },
    },

})

export const{startWorkout,updateElapsedTime,stopWorkout}=timerSlice.actions

export default timerSlice.reducer
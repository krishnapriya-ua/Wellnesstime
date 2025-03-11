import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import adminReducer from './slices/adminSlice'
import timerReducer from './slices/timerSlice'
import trainerReducer from './slices/trainerSlice'
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { persistStore, persistReducer } from 'redux-persist';


const persistConfig = {
    key: 'root',
    storage,
};

const rootReducer = combineReducers({
    user: userReducer,
    admin:adminReducer,
    timer:timerReducer,
    trainer:trainerReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
    devTools:process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);
export default store;

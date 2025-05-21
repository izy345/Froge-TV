import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authSliceReducer from './AuthSlice/auth-slice';
import homeSliceReducer from './homeSlice/home-slice';
import phoneSliceReducer from './Phone/phone-slice';
import streamSliceReducer from './StreamSlice/stream-slice';
import emoteDetailsModalSliceReducer from './EmoteDetailsModal/emoteDetailsModal-slice';
import chatInputSliceReducer from './ChatInput/chatInput-slice';
import configSliceReducer from './Configuration/config-slice';
import userDetailsModalSliceReducer from './UserDetailsModal/user-details-modal-slice';
import searchSliceReducer from './SearchSlice/search-slice';
import cacheSliceReducer from './cache/cache-slice';
import { persistReducer, persistStore } from 'redux-persist';

// Use Expo's async storage solution
import AsyncStorage from '@react-native-async-storage/async-storage';

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['auth', 'config']  // only persist auth & config
};

const rootReducer = combineReducers({
    auth: authSliceReducer,
    home: homeSliceReducer,
    phone: phoneSliceReducer,
    stream: streamSliceReducer,
    emoteDetailsModal: emoteDetailsModalSliceReducer,
    chatInput: chatInputSliceReducer,
    config: configSliceReducer,
    userDetailsModal: userDetailsModalSliceReducer,
    search: searchSliceReducer,
    cache: cacheSliceReducer,

});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false })
});

export const persistor = persistStore(store);
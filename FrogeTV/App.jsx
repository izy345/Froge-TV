import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import Routes from './routes';
import { store, persistor } from './store';
import { PersistGate } from 'redux-persist/integration/react';
import { Platform, Text} from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import ExpoPip from "expo-pip";
import PIPModeAndroid from './routes/PIPModeAndroid'
import { init, clearDatabase } from './database';
//import expoAndroidPip from './modules/expo-android-pip';

export default function App() {
    const { isInPipMode } = ExpoPip.useIsInPip();

    useEffect(() => {
        if (Platform.OS === 'android') {
            NavigationBar.setBackgroundColorAsync('#000000');
            NavigationBar.setButtonStyleAsync('light'); 
        }
    }, []);

    useEffect(() => {
        init()
        .then(() => {
            console.log('Initialized database')
        })
        .catch((err) => {
            console.log('Initialize database failed:', err)
        })
},[])
    
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                { !isInPipMode ? <Routes /> : <PIPModeAndroid/>}
            </PersistGate>
        </Provider>
    );
}
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import AuthScreen from "../screens/AuthScreens";
import Colors from "../constants";
import HomeRoutes from "./HomeRoutes";
import { Platform } from "react-native";
import * as ScreenOrientation from 'expo-screen-orientation';
import { useDispatch, useSelector } from "react-redux";
import { phoneSliceActions } from "../store/Phone/phone-slice";
import { useEffect } from "react";
import StreamScreen from "../screens/StreamScreen";
import CheckAuth from "../screens/AuthScreens/CheckAuth";

const Stack = createNativeStackNavigator();


function Routes() {

    const dispatch = useDispatch();
    const phoneIsPotrait = useSelector((state) => state.phone.phoneIsPotrait);

    const showLoginBanner = useSelector((state) => state.auth.showLoginBanner);


    useEffect(() => {
        async function getOrientation() {
            const orientation = await ScreenOrientation.getOrientationAsync();
            // get screen dimensions
            // Orientation types such as PORTRAIT_UP or PORTRAIT_DOWN mean portrait.
            const isPortrait =
                orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
                orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN;
            dispatch(phoneSliceActions.setPhoneIsPotrait(isPortrait));
        }

        getOrientation();

        const subscription = ScreenOrientation.addOrientationChangeListener(
            ({ orientationInfo }) => {
                const { orientation } = orientationInfo;
                const isPortrait =
                    orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
                    orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN;
                dispatch(phoneSliceActions.setPhoneIsPotrait(isPortrait));
            }
        );

        return () => {
            ScreenOrientation.removeOrientationChangeListener(subscription);
        };
    }, [dispatch]);


    return (
        <>
            {/*<StatusBar style="light" />*/}
            <NavigationContainer>
            {showLoginBanner && (<CheckAuth />)}
                <Stack.Navigator
                    initialRouteName="Login"
                    screenOptions={{
                        // screen contents
                        statusBarStyle: "light", // uncomment this line to set the status bar style to light on dev builds
                        contentStyle: { backgroundColor: Colors.oledBlack },
                        headerStyle: {
                            backgroundColor: Colors.twitchBlack1000,
                            borderBottomColor: "white",
                            borderBottomWidth: 2,
                            borderStyle: "solid",
                        },
                        headerTitleStyle: { color: Colors.twitchWhite1000 },
                    }}
                >
                    <Stack.Screen name="Login" component={AuthScreen} />

                    <Stack.Screen
                        name="Stream"
                        component={StreamScreen}
                        options={{
                            headerShown: false,
                            navigationBarHidden: true,
                            statusBarHidden: Platform.OS === 'android' ? (phoneIsPotrait ? false : true) : false,

                        }}
                    />

                    <Stack.Screen
                        name="HomeRoutes"
                        component={HomeRoutes}
                        options={{
                            headerShown: false,
                            title: "Home",
                        }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </>
    );
}

export default Routes;

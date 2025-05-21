import { View, Text } from "react-native"
import { NavigationContainer } from '@react-navigation/native';
//import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from "../screens/HomeScreen";
import Settings from "../screens/SettingsScreen";
import Search from "../screens/SearchScreen";
import Colors from "../constants";
import { Ionicons } from '@expo/vector-icons';
import SearchRoutes from "./SearchRoutes";


//const Stack = createNativeStackNavigator();
const BottomTab = createBottomTabNavigator();

function HomeRoutes() {


    return (
        <>
        <BottomTab.Navigator
            id='home'
            screenOptions={{
                // screen contents
                sceneStyle: { backgroundColor: Colors.oledBlack },
                // bottom tab design 
                tabBarActiveTintColor: Colors.twitchPurple1000,
                tabBarInactiveTintColor: Colors.twitchWhite1000,
                tabBarStyle: { backgroundColor: Colors.twitchBlack1000 },
                sceneContainerStyle: { backgroundColor: Colors.oledBlack },
                // top tab design
                headerStyle: {
                    backgroundColor: Colors.twitchBlack1000,
                    borderBottomColor: Colors.twitchBlack900,
                    borderBottomWidth: 1,
                },
                headerTitleStyle: { color: Colors.twitchWhite1000 },
            }}
        >
            <BottomTab.Screen 
                name="Home" 
                component={Home}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
                    ),
                    title: 'Following',
                }}
            />
            <BottomTab.Screen 
                name="Explore" 
                component={SearchRoutes}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons name={focused ? 'search' : 'search-outline'} size={size} color={color} />
                    )
                }}
            />
            <BottomTab.Screen 
                name="Settings" 
                component={Settings}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
                    )
                }}
            />
        </BottomTab.Navigator>
    </>
    )
}

export default HomeRoutes
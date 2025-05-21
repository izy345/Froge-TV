import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Search from "../screens/SearchScreen";
import Colors from "../constants";
import StreamsFromCategory from "../screens/SearchScreen/StreamsFromCategory";
import SearchResult from "../screens/SearchScreen/SearchResult";

const SearchStack = createNativeStackNavigator();

function SearchRoutes() {
    return (
        <SearchStack.Navigator 
            initialRouteName="SearchIndex"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.oledBlack },
            }}
            
        >
            <SearchStack.Screen name="SearchIndex" component={Search} />
            <SearchStack.Screen name="StreamsFromCategory" component={StreamsFromCategory}/>
            <SearchStack.Screen name="SearchResults" component={SearchResult} />
        </SearchStack.Navigator>
    );
}

export default SearchRoutes;
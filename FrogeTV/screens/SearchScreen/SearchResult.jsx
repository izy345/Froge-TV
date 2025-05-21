import { useLayoutEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native"
import Icon from "../../ui/CustomIcons";
import Colors from "../../constants";
import SearchResultRender from "../../components/SearchResultRender";
import { useIsFocused } from "@react-navigation/native";

function SearchResult({ route, navigation }) {

    const { search } = route.params;

    const isFocused = useIsFocused();

    useLayoutEffect(() => {
        if (!isFocused) return;
        const parent = navigation.getParent('home');
        // Set the header for this screen
        parent?.setOptions({
            headerTitle: 'Search Results',
            headerLeft: () => (
                <Pressable
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Icon
                        icon="arrow-back-outline"
                        size={24}
                        color={Colors.twitchWhite1000}
                    />
                </Pressable>
            ),
        });
    }, [search, isFocused]);

    return (
    <View style={styles.rootContainer}>
        <SearchResultRender
            searchQuery={search}
        />
    </View>
    )
}

export default SearchResult

const styles = StyleSheet.create({
    text:{
        color: Colors.twitchWhite1000,
    },
    backButton: {
        
        marginLeft: 7,
        marginRight: 7, 
    },
    rootContainer:{
        flex: 1,
    }
})
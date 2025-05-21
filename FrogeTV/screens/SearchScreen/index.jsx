import { View, Text, StyleSheet, TextInput, ScrollView } from "react-native"
import Colors from "../../constants"
import Icon from "../../ui/CustomIcons"
import SearchInput from "../../ui/SearchInput"
import RenderSearch from "../../components/RenderSearch"
import IOSKeyboardAvoidingView from "../../components/KeyboardAvoidingView"
import { useIsFocused } from "@react-navigation/native"
import { useLayoutEffect } from "react"

function Search({navigation}) {

    const isFocused = useIsFocused();

    useLayoutEffect(() => {
        if (!isFocused) return;
        // Set the header for this screen
        const parent = navigation.getParent('home');
        parent.setOptions({
            headerTitle: undefined,
            headerLeft: undefined,
        });
    }, [isFocused]);

    return (
        <IOSKeyboardAvoidingView
            style ={styles.rootContainer}
            behavior={"padding"}
        >
            <RenderSearch />
        </IOSKeyboardAvoidingView>
    )
}

export default Search

const styles = StyleSheet.create({
    rootContainer:{
        flex: 1,
    },
    topHeaderContainer:{
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        padding: 10,
        backgroundColor: Colors.oledBlack,
    },
    textColor:{
        color: Colors.twitchWhite1000
    }
})